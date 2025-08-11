import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiChevronLeft,
  FiChevronRight,
  FiSettings,
  FiPlus,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import RentalWorkflowIndicator from "../../components/vendor/RentalWorkflowIndicator";
import RentalOrderActions from "../../components/vendor/RentalOrderActions";
import OrderIdGenerator from "../../components/vendor/OrderIdGenerator";
import RentalOrderSummary from "../../components/vendor/RentalOrderSummary";

const VendorRentalPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('order-lines');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(80);
  const [workflowStage, setWorkflowStage] = useState("quotation");

  // Generate unique order ID
  const generateOrderId = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `R${timestamp}${random}`;
  };

  // Generate unique product ID
  const generateProductId = () => {
    const timestamp = Date.now().toString().slice(-4);
    const random = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    return `P${timestamp}${random}`;
  };

  // Sample rental order data with unique ID
  const [rentalOrder, setRentalOrder] = useState({
    id: generateOrderId(),
    customer: "",
    invoiceAddress: "",
    deliveryAddress: "",
    rentalTemplate: "",
    expiration: "",
    rentalOrderDate: new Date().toISOString().split("T")[0],
    priceList: "",
    rentalPeriod: "",
    rentalDuration: "",
    orderLines: [
      {
        id: generateProductId(),
        product: "Product 1",
        quantity: 5,
        unitPrice: 200,
        tax: 0,
        subTotal: 1000,
      },
    ],
    termsConditions: "",
    untaxedTotal: 1000,
    tax: 0,
    total: 1000,
  });

  // Action handlers
  const handleSave = () => {
    console.log("Saving rental order:", rentalOrder);
    // Implement save logic
  };

  const handleSend = () => {
    console.log("Sending quotation to customer");
    setWorkflowStage("quotation-sent");
  };

  const handlePrint = () => {
    console.log("Printing rental order");
    window.print();
  };

  const handleConfirm = () => {
    console.log('Confirming rental order');
    setWorkflowStage('rental-order');

    // Redirect to confirmation page after confirming
    setTimeout(() => {
      navigate(`/vendor/orders/${rentalOrder.id}/confirmed`);
    }, 1000);
  };

  const handleCancel = () => {
    console.log("Canceling rental order");
    // Implement cancel logic
  };

  const handleEmailCustomer = () => {
    console.log("Emailing customer");
    // Implement email logic
  };

  const handleExportPDF = () => {
    console.log("Exporting to PDF");
    // Implement PDF export logic
  };

  const handleUpdatePrices = () => {
    // Prevent price updates for confirmed orders
    if (workflowStage === "rental-order") {
      alert("Cannot update prices for confirmed rental orders");
      return;
    }

    if (!rentalOrder.priceList) {
      alert("Please select a price list first");
      return;
    }

    console.log("Updating prices based on price list:", rentalOrder.priceList);

    // Example price updates based on selected price list
    const priceMultipliers = {
      standard: 1.0,
      premium: 1.5,
      bulk: 0.8,
    };

    const multiplier = priceMultipliers[rentalOrder.priceList] || 1.0;

    const updatedOrderLines = rentalOrder.orderLines.map((line) => ({
      ...line,
      unitPrice: Math.round(line.unitPrice * multiplier),
      subTotal: Math.round(line.quantity * line.unitPrice * multiplier),
    }));

    setRentalOrder((prev) => ({
      ...prev,
      orderLines: updatedOrderLines,
    }));

    calculateTotals(updatedOrderLines);
    console.log("Prices updated successfully");
  };

  // Check if prices can be updated based on workflow stage
  const canUpdatePrices = () => {
    return workflowStage !== "rental-order";
  };

  const createNewRentalOrder = () => {
    const newOrder = {
      id: generateOrderId(),
      customer: "",
      invoiceAddress: "",
      deliveryAddress: "",
      rentalTemplate: "",
      expiration: "",
      rentalOrderDate: new Date().toISOString().split("T")[0],
      priceList: "",
      rentalPeriod: "",
      rentalDuration: "",
      orderLines: [
        {
          id: generateProductId(),
          product: "Product 1",
          quantity: 1,
          unitPrice: 0,
          tax: 0,
          subTotal: 0,
        },
      ],
      termsConditions: "",
      untaxedTotal: 0,
      tax: 0,
      total: 0,
    };

    setRentalOrder(newOrder);
    setWorkflowStage("quotation");
    setActiveTab("order-lines");
    console.log("Created new rental order:", newOrder.id);
  };

  const handleInputChange = (field, value) => {
    setRentalOrder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOrderLineChange = (index, field, value) => {
    const updatedOrderLines = [...rentalOrder.orderLines];
    updatedOrderLines[index] = {
      ...updatedOrderLines[index],
      [field]: value,
    };

    // Recalculate subtotal if quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      updatedOrderLines[index].subTotal =
        updatedOrderLines[index].quantity * updatedOrderLines[index].unitPrice;
    }

    setRentalOrder((prev) => ({
      ...prev,
      orderLines: updatedOrderLines,
    }));

    // Recalculate totals
    calculateTotals(updatedOrderLines);
  };

  const calculateTotals = (orderLines) => {
    const untaxedTotal = orderLines.reduce(
      (sum, line) => sum + line.subTotal,
      0
    );
    const tax = untaxedTotal * 0; // No tax in this example
    const total = untaxedTotal + tax;

    setRentalOrder((prev) => ({
      ...prev,
      untaxedTotal,
      tax,
      total,
    }));
  };

  const addOrderLine = () => {
    const newOrderLine = {
      id: generateProductId(),
      product: `Product ${rentalOrder.orderLines.length + 1}`,
      quantity: 1,
      unitPrice: 0,
      tax: 0,
      subTotal: 0,
    };

    setRentalOrder((prev) => ({
      ...prev,
      orderLines: [...prev.orderLines, newOrderLine],
    }));
  };

  const removeOrderLine = (index) => {
    const updatedOrderLines = rentalOrder.orderLines.filter(
      (_, i) => i !== index
    );
    setRentalOrder((prev) => ({
      ...prev,
      orderLines: updatedOrderLines,
    }));
    calculateTotals(updatedOrderLines);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Rental Order Form View</h1>

            {/* Navigation Tabs */}
            <nav className="flex space-x-1">
              <Link
                to="/vendor-dashboard"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/vendor/rental"
                className="px-4 py-2 bg-gray-700 text-white rounded-md text-sm"
              >
                Rental
              </Link>
              <Link
                to="/vendor/orders"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Order
              </Link>
              <Link
                to="/vendor/products"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Products
              </Link>
              <Link
                to="/vendor/reports"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Reporting
              </Link>
              <Link
                to="/vendor/settings"
                className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md text-sm transition-colors"
              >
                Setting
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* User Profile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.firstName?.[0]?.toUpperCase() || "A"}
                </span>
              </div>
              <span className="text-sm">{user?.firstName || "Admin"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Create Button */}
            <button
              onClick={createNewRentalOrder}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create
            </button>

            <span className="text-gray-400 text-sm">Rental Orders</span>
            <FiSettings className="w-4 h-4 text-gray-400" />

            {/* Action Buttons */}
            <RentalOrderActions
              onSave={handleSave}
              onSend={handleSend}
              onPrint={handlePrint}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
              onEmailCustomer={handleEmailCustomer}
              onExportPDF={handleExportPDF}
              workflowStage={workflowStage}
            />
          </div>

          <div className="flex items-center space-x-4">
            {/* Pagination Info */}
            <span className="text-sm text-gray-400">
              {currentPage}/{totalPages}
            </span>

            {/* Pagination Controls */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                disabled={currentPage === 1}
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                className="p-1 text-gray-400 hover:text-white transition-colors"
                disabled={currentPage === totalPages}
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Workflow Indicators */}
      <div className="bg-gray-800 px-6 py-3 border-b border-gray-700">
        <RentalWorkflowIndicator
          currentStage={workflowStage}
          onStageChange={setWorkflowStage}
        />
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          {/* Order ID */}
          <div className="mb-6">
            <OrderIdGenerator
              currentId={rentalOrder.id}
              onIdChange={(newId) =>
                setRentalOrder((prev) => ({ ...prev, id: newId }))
              }
              prefix="R"
            />
          </div>

          {/* Order Summary */}
          <RentalOrderSummary rentalOrder={rentalOrder} />

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Customer :
                </label>
                <input
                  type="text"
                  value={rentalOrder.customer}
                  onChange={(e) =>
                    handleInputChange("customer", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Invoice Address :
                </label>
                <textarea
                  value={rentalOrder.invoiceAddress}
                  onChange={(e) =>
                    handleInputChange("invoiceAddress", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Address :
                </label>
                <textarea
                  value={rentalOrder.deliveryAddress}
                  onChange={(e) =>
                    handleInputChange("deliveryAddress", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  rows="3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rental Template :
                </label>
                <select
                  value={rentalOrder.rentalTemplate}
                  onChange={(e) =>
                    handleInputChange("rentalTemplate", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Select Template</option>
                  <option value="standard">Standard Rental</option>
                  <option value="premium">Premium Rental</option>
                  <option value="custom">Custom Rental</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Expiration :
                </label>
                <input
                  type="date"
                  value={rentalOrder.expiration}
                  onChange={(e) =>
                    handleInputChange("expiration", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rental Order Date :
                </label>
                <input
                  type="date"
                  value={rentalOrder.rentalOrderDate}
                  onChange={(e) =>
                    handleInputChange("rentalOrderDate", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    PriceList :
                  </label>
                  {!canUpdatePrices() && (
                    <span className="text-xs text-orange-400 bg-orange-900/20 px-2 py-1 rounded">
                      🔒 Pricing Locked
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <select
                    value={rentalOrder.priceList}
                    onChange={(e) =>
                      handleInputChange("priceList", e.target.value)
                    }
                    disabled={!canUpdatePrices()}
                    className={`flex-1 px-3 py-2 rounded-md border focus:outline-none ${
                      canUpdatePrices()
                        ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500 cursor-pointer"
                        : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50"
                    }`}
                  >
                    <option value="">Select Price List</option>
                    <option value="standard">Standard Pricing</option>
                    <option value="premium">Premium Pricing</option>
                    <option value="bulk">Bulk Pricing</option>
                  </select>
                  <button
                    onClick={handleUpdatePrices}
                    disabled={!canUpdatePrices()}
                    className={`px-4 py-2 rounded-md text-sm transition-colors whitespace-nowrap ${
                      canUpdatePrices()
                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                    title={
                      canUpdatePrices()
                        ? "Update prices based on selected price list"
                        : "Cannot update prices for confirmed rental orders"
                    }
                  >
                    Update Prices
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rental Period :
                </label>
                <input
                  type="text"
                  value={rentalOrder.rentalPeriod}
                  onChange={(e) =>
                    handleInputChange("rentalPeriod", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., Weekly, Monthly"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Rental Duration :
                </label>
                <input
                  type="text"
                  value={rentalOrder.rentalDuration}
                  onChange={(e) =>
                    handleInputChange("rentalDuration", e.target.value)
                  }
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g., 1 week, 2 months"
                />
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="border-t border-gray-700 pt-6">
            {/* Tab Navigation */}
            <div className="flex space-x-8 mb-6">
              <button
                onClick={() => setActiveTab("order-lines")}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "order-lines"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Order lines
              </button>
              <button
                onClick={() => setActiveTab("other-details")}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "other-details"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Other details
              </button>
              <button
                onClick={() => setActiveTab("rental-notes")}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "rental-notes"
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-gray-400 hover:text-gray-300"
                }`}
              >
                Rental Notes
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "order-lines" && (
              <div className="space-y-6">
                {/* Product Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                          Product ID
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                          Product
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                          Quantity
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                          Unit Price
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                          Tax
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                          Sub Total
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rentalOrder.orderLines.map((line, index) => (
                        <tr key={line.id} className="border-b border-gray-700">
                          <td className="py-3 px-4">
                            <span className="text-blue-400 font-mono text-sm">
                              {line.id}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={line.product}
                              onChange={(e) =>
                                handleOrderLineChange(
                                  index,
                                  "product",
                                  e.target.value
                                )
                              }
                              className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                              placeholder="Product name"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              value={line.quantity}
                              onChange={(e) =>
                                handleOrderLineChange(
                                  index,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-20 bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                              min="0"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              value={line.unitPrice}
                              onChange={(e) =>
                                handleOrderLineChange(
                                  index,
                                  "unitPrice",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              disabled={!canUpdatePrices()}
                              className={`w-24 px-2 py-1 rounded border text-sm ${
                                canUpdatePrices()
                                  ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:outline-none"
                                  : "bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed opacity-50"
                              }`}
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              value={line.tax}
                              onChange={(e) =>
                                handleOrderLineChange(
                                  index,
                                  "tax",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-20 bg-gray-700 text-white px-2 py-1 rounded border border-gray-600 focus:border-blue-500 focus:outline-none text-sm"
                              min="0"
                              step="0.01"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-white font-medium">
                              {line.subTotal}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => removeOrderLine(index)}
                              disabled={
                                !canUpdatePrices() ||
                                rentalOrder.orderLines.length === 1
                              }
                              className={`transition-colors ${
                                canUpdatePrices() &&
                                rentalOrder.orderLines.length > 1
                                  ? "text-red-400 hover:text-red-300 cursor-pointer"
                                  : "text-gray-600 cursor-not-allowed opacity-50"
                              }`}
                              title={
                                !canUpdatePrices()
                                  ? "Cannot remove products from confirmed rental orders"
                                  : rentalOrder.orderLines.length === 1
                                  ? "Cannot remove the last product"
                                  : "Remove this product from the order"
                              }
                            >
                              <FiX className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Product Button */}
                <div className="flex justify-start">
                  <button
                    onClick={addOrderLine}
                    disabled={!canUpdatePrices()}
                    className={`px-4 py-2 rounded-md text-sm transition-colors flex items-center ${
                      canUpdatePrices()
                        ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                        : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                    title={
                      canUpdatePrices()
                        ? "Add a new product to the order"
                        : "Cannot modify products in confirmed rental orders"
                    }
                  >
                    <FiPlus className="w-4 h-4 mr-2" />
                    Add Product
                  </button>
                </div>

                {/* Bottom Section with Terms and Totals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                  {/* Terms & Conditions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Terms & Condition
                    </label>
                    <textarea
                      value={rentalOrder.termsConditions}
                      onChange={(e) =>
                        handleInputChange("termsConditions", e.target.value)
                      }
                      className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                      rows="6"
                      placeholder="Enter terms and conditions..."
                    />
                  </div>

                  {/* Totals */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Untaxed Total :</span>
                      <span className="text-white font-medium">
                        {rentalOrder.untaxedTotal}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Tax :</span>
                      <span className="text-white font-medium">
                        {rentalOrder.tax}
                      </span>
                    </div>
                    <div className="flex justify-between items-center border-t border-gray-600 pt-3">
                      <span className="text-white font-semibold">Total :</span>
                      <span className="text-white font-semibold text-lg">
                        {rentalOrder.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "other-details" && (
              <div className="space-y-4">
                <div className="text-gray-400">
                  <p>
                    Additional order details and configurations will be
                    displayed here.
                  </p>
                  <p>
                    This section can include delivery instructions, special
                    requirements, and other order-specific information.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "rental-notes" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Internal Notes
                  </label>
                  <textarea
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    rows="6"
                    placeholder="Add internal notes about this rental order..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Customer Notes
                  </label>
                  <textarea
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-md border border-gray-600 focus:border-blue-500 focus:outline-none"
                    rows="4"
                    placeholder="Notes visible to the customer..."
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorRentalPage;
