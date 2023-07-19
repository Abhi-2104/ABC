<?php
// Check if the form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Check if cart data is received
    if (isset($_POST["cart-data"])) {
        // Retrieve cart data from the form submission
        $cartData = json_decode($_POST["cart-data"], true);

        // Retrieve other form data
        $name = $_POST["name"];
        $phone = $_POST["phone"];
        $address = $_POST["address"];

        // Connect to MySQL database (assuming your database credentials)
        $host = "localhost";
        $username = "root";
        $password = "";
        $dbname = "urulaiorders";

        // Create connection
        $conn = new mysqli($host, $username, $password, $dbname);

        // Check connection
        if ($conn->connect_error) {
            die("Connection failed: " . $conn->connect_error);
        }

        // Create the 'orders' table if it doesn't exist
        $createTableSql = "CREATE TABLE IF NOT EXISTS orders (
            OrderID INT AUTO_INCREMENT PRIMARY KEY,
            Name VARCHAR(255) NOT NULL,
            Phone VARCHAR(20) NOT NULL,
            Address VARCHAR(255) NOT NULL,
            ItemName VARCHAR(255) NOT NULL,
            Quantity INT NOT NULL,
            Price DECIMAL(10, 2) NOT NULL
        )";

        if ($conn->query($createTableSql) === FALSE) {
            die("Error creating table: " . $conn->error);
        }

        // Prepare and execute SQL statements to insert data into the database
        $insertSql = "INSERT INTO orders (Name, Phone, Address, ItemName, Quantity, Price) VALUES (?, ?, ?, ?, ?, ?)";
        $stmt = $conn->prepare($insertSql);

        // Loop through each item in the cart and insert its data into the table
        foreach ($cartData as $item) {
            $itemName = $item["name"];
            $itemPrice = $item["price"];
            $itemQuantity = $item["quantity"];
            $totalItemPrice = floatval(str_replace("$", "", $itemPrice)) * $itemQuantity; // Calculate the total price for the item

            // Bind the parameters to the placeholders
            $stmt->bind_param("ssssid", $name, $phone, $address, $itemName, $itemQuantity, $totalItemPrice);
            $stmt->execute();
        }

        // Close connection
        $stmt->close();
        $conn->close();

        // Unset the cart data and redirect to the thank you page
        unset($_POST["cart-data"]);
        $thankYouPageUrl = "thankyou.html";
        header("Location: " . $thankYouPageUrl);
        exit;
    }
}
?>
