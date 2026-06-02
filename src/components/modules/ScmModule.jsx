import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ModuleShell from './ModuleShell';
import InventoryManager from './scm/InventoryManager';
import SupplierManager from './scm/SupplierManager';
import ShippingManager from './scm/ShippingManager';

/**
 * SCM module: inventory, suppliers and shipping logistics.
 */
const SCM_TABS = [
    { label: 'Inventario', path: '/scm/inventario' },
    { label: 'Proveedores', path: '/scm/proveedores' },
    { label: 'Envios', path: '/scm/envios' },
];

const ScmModule = () => (
    <ModuleShell title="SCM" subtitle="Supply Chain Management" tabs={SCM_TABS}>
        <Routes>
            <Route index element={<Navigate to="/scm/inventario" replace />} />
            <Route path="inventario" element={<InventoryManager />} />
            <Route path="proveedores" element={<SupplierManager />} />
            <Route path="envios" element={<ShippingManager />} />
            <Route path="*" element={<Navigate to="/scm/inventario" replace />} />
        </Routes>
    </ModuleShell>
);

export default ScmModule;
