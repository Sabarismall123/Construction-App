import mongoose, { Document } from 'mongoose';
export interface IResource extends Document {
    name: string;
    type: 'equipment' | 'material' | 'vehicle' | 'tool' | 'other';
    category: string;
    description: string;
    quantity: number;
    unit: string;
    costPerUnit: number;
    supplier?: string;
    location: string;
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
    assignedTo?: mongoose.Types.ObjectId;
    projectId?: mongoose.Types.ObjectId;
    purchaseDate: Date;
    warrantyExpiry?: Date;
    maintenanceSchedule?: Date;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IResource, {}, {}, {}, mongoose.Document<unknown, {}, IResource, {}, {}> & IResource & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Resource.d.ts.map