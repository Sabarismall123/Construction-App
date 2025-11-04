import mongoose, { Document } from 'mongoose';
export interface IProject extends Document {
    name: string;
    description: string;
    client: string;
    location: string;
    gpsLocation?: {
        latitude: number;
        longitude: number;
        accuracy: number;
        address?: string;
    };
    startDate: Date;
    endDate: Date;
    budget: number;
    status: 'planning' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled';
    progress: number;
    projectManager: mongoose.Types.ObjectId;
    team: mongoose.Types.ObjectId[];
    siteVisits?: {
        visitType: 'site_visit' | 'inspection' | 'delivery' | 'maintenance';
        location: {
            latitude: number;
            longitude: number;
            accuracy: number;
            address?: string;
        };
        timestamp: Date;
        notes?: string;
        photos?: string[];
    }[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, {}> & IProject & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Project.d.ts.map