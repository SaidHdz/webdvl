import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModuleShell from './ModuleShell';
import ClientManager from './crm/ClientManager';
import SalesAnalytics from './crm/SalesAnalytics';

/**
 * CRM module: clients with purchase history and sales analytics.
 */
const CRM_TABS = [
    { label: 'Clientes', path: '/crm/clientes' },
    { label: 'Ventas', path: '/crm/ventas' },
];

const CrmModule = () => (
    <ModuleShell title="CRM" subtitle="Customer Relationship Management" tabs={CRM_TABS}>
        <Routes>
            <Route index element={<Navigate to="/crm/clientes" replace />} />
            <Route path="clientes" element={<ClientManager />} />
            <Route path="ventas" element={<SalesAnalytics />} />
            <Route path="*" element={<Navigate to="/crm/clientes" replace />} />
        </Routes>
    </ModuleShell>
);

export default CrmModule;
