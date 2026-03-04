1.  **Create `MerchantHeader.js`:** Extract the top header part from `MerchantClient` into a separate component.
2.  **Create `KanbanBoard.js`:** Extract the "Live Orders" kanban section. Pass necessary props (like `orders`, `kanbanColumns`, `isUpdating`, `updateStatus`, `refreshOrders`).
3.  **Create `MenuManagement.js`:** Extract the "Menu Visibility", "Active Deals", and "Total Earnings" side panel. Pass necessary props (like `menuItems`, `toggleAvailability`, `deals`, `totalRevenue`, `settlements`, `setIsSettingsOpen`).
4.  **Create `SettingsModal.js`:** Extract the settings modal form. Pass necessary props (`isSettingsOpen`, `setIsSettingsOpen`, `settingsForm`, `setSettingsForm`, `handleUpdateSettings`, `isUpdating`).
5.  **Refactor `MerchantClient.js`:** Import the new subcomponents and replace the large inline JSX with these clean component calls.
6.  **Run tests:** Ensure the test suite passes after refactoring.
