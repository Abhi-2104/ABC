$(document).ready(function() {
  // Retrieve cart data from Local Storage
  var cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Update cart count and display
  updateCart();

  // Handle click events on navigation links
  $('nav ul li a').click(function(e) {
    e.preventDefault();
    var url = $(this).attr('href');
    if (url === 'cart.html#cart') {
      // If going back to cart page, clear the cart data
      cart = [];
      updateCart();
      localStorage.removeItem('cart');
    }
    $.get(url, function(data) {
      $('#content').html($(data).find('#content').html());
      $('header').html($(data).find('header').html());
      $('nav').html($(data).find('nav').html());
      attachAddToCartListeners();
      $('html, body').animate({scrollTop: 0}, 'slow');
    });
  });

  // Event listener for form submission (checkout)
  $('#order-form').submit(function(e) {
    e.preventDefault();
    if (cart.length === 0) {
      $('#checkout-message').text("There is nothing in the cart.");
    } else {
      var name = $('#name').val();
      var phone = $('#phone').val();
      var address = $('#address').val();
      if (name === "" || phone === "" || address === "") {
        alert("Please fill in all required fields.");
      } else {
        // Calculate the total price for each item in the cart
        for (var i = 0; i < cart.length; i++) {
          var item = cart[i];
          item.totalPrice = parseFloat(item.price.replace('$', '')) * item.quantity;
        }

        $('<input>').attr({
          type: 'hidden',
          name: 'cart-data',
          value: JSON.stringify(cart)
        }).appendTo('#order-form');

        // Clear the cart and update the display after form submission
        $(this).off('submit').submit();
        cart = [];
        updateCart();
        localStorage.removeItem('cart');
      }
    }
  });

  $('#clear-cart-btn').click(function() {
    if (confirm("Are you sure you want to clear the cart?")) {
      cart = [];
      updateCart();
      localStorage.removeItem('cart');
      $('#name, #phone, #address').val('');
      return false;
    }
  });

  function attachAddToCartListeners() {
    $('.add-to-cart-btn').off().click(function() {
      var $menuItem = $(this).closest('.menu-item');
      var $quantitySection = $menuItem.find('.quantity-section');
      if ($quantitySection.is(':visible')) {
        var itemQuantity = parseInt($menuItem.find('.quantity-value').text());
        if (itemQuantity === 0) {
          alert("Minimum quantity should be 1. Please add at least 1 item to the cart.");
        } else {
          var itemName = $menuItem.find('.menu-item-name').text();
          var itemPrice = $menuItem.find('.menu-item-price').text();
          addToCart(itemName, itemPrice, itemQuantity);
          alert(itemName + " added to cart successfully");
          $menuItem.find('.quantity-value').text('1');
          $menuItem.find('.quantity-btn').prop('disabled', true);
          $quantitySection.hide();
        }
      } else {
        $quantitySection.show();
        $menuItem.find('.quantity-btn').prop('disabled', false);
      }
    });
    
    $('.quantity-btn.minus').off().click(function() {
      var $menuItem = $(this).closest('.menu-item');
      var quantityValue = parseInt($menuItem.find('.quantity-value').text());
      if (quantityValue > 1) {
        quantityValue--;
        $menuItem.find('.quantity-value').text(quantityValue);
        $menuItem.find('.quantity-btn.minus').prop('disabled', quantityValue === 1);
      } else {
        alert("Minimum quantity is 1. Please select a valid quantity.");
      }
    });

    $('.quantity-btn.plus').off().click(function() {
      var $menuItem = $(this).closest('.menu-item');
      var quantityValue = parseInt($menuItem.find('.quantity-value').text());
      quantityValue++;
      $menuItem.find('.quantity-value').text(quantityValue);
      $menuItem.find('.quantity-btn.minus').prop('disabled', false);
    });
  }

  function addToCart(name, price, quantity) {
    var existingItem = cart.find(item => item.name === name);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ name: name, price: price, quantity: quantity });
    }
    updateCart();
  }

  function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIconCount();
    updateCartDisplay();
  }

  function updateCartIconCount() {
    var count = cart.reduce((total, item) => total + item.quantity, 0);
    var cartIcon = $('#cart-icon');
    var countElement = cartIcon.find('.cart-count');
    if (count === 0) {
      countElement.remove();
    } else {
      if (countElement.length === 0) {
        countElement = $('<span class="cart-count"></span>');
        cartIcon.append(countElement);
      }
      countElement.text(count);
    }
  }

 
  function updateCartDisplay() {
    var cartItemsContainer = $('#cart-items tbody');
    cartItemsContainer.empty();
    if (cart.length === 0) {
      cartItemsContainer.html('<tr><td colspan="6">There is nothing in the cart.</td></tr>');
      $('#cart-options').hide();
    } else {
      $('#cart-options').show();
      for (var i = 0; i < cart.length; i++) {
        var item = cart[i];
        var itemTotalPrice = item.quantity * parseFloat(item.price.replace('$', ''));
        var itemElement = $('<tr>' +
          '<td><img class="cart-item-image" src="https://dummyimage.com/100x100/000/fff" alt="Item"></td>' +
          '<td class="item-name">' + item.name + '</td>' +
          '<td class="quantity-controls">' +
            '<button class="quantity-btn minus">-</button>' +
            '<span class="quantity-value">' + item.quantity + '</span>' +
            '<button class="quantity-btn plus">+</button>' +
          '</td>' +
          '<td class="item-price">' + item.price + '</td>' +
          '<td class="item-total-price">' + formatCurrency(itemTotalPrice) + '</td>' +
          '<td><button class="delete-item-btn">Delete</button></td>' +
          '</tr>');
        cartItemsContainer.append(itemElement);
      }

      $('.quantity-btn.minus').click(function() {
        var $itemRow = $(this).closest('tr');
        var itemName = $itemRow.find('.item-name').text();
        var item = cart.find(item => item.name === itemName);
        if (item && item.quantity > 1) {
          item.quantity--;
          updateCart();
        }
      });

      $('.quantity-btn.plus').click(function() {
        var $itemRow = $(this).closest('tr');
        var itemName = $itemRow.find('.item-name').text();
        var item = cart.find(item => item.name === itemName);
        if (item) {
          item.quantity++;
          updateCart();
        }
      });

      $('.delete-item-btn').click(function() {
        var $itemRow = $(this).closest('tr');
        var itemName = $itemRow.find('.item-name').text();
        var itemIndex = cart.findIndex(item => item.name === itemName);
        if (itemIndex !== -1) {
          cart.splice(itemIndex, 1);
          updateCart();
        }
      });
    }
  }

  function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
  }
    // Attach event listeners for "Add to Cart" buttons
    attachAddToCartListeners();
  });
