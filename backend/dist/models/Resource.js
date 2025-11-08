"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ResourceSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Resource name is required'],
        trim: true,
        maxlength: [100, 'Name cannot be more than 100 characters']
    },
    type: {
        type: String,
        enum: ['equipment', 'material', 'vehicle', 'tool', 'other'],
        required: [true, 'Resource type is required']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        maxlength: [50, 'Category cannot be more than 50 characters']
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative']
    },
    unit: {
        type: String,
        required: [true, 'Unit is required'],
        trim: true,
        maxlength: [20, 'Unit cannot be more than 20 characters']
    },
    costPerUnit: {
        type: Number,
        required: [true, 'Cost per unit is required'],
        min: [0, 'Cost cannot be negative']
    },
    supplier: {
        type: String,
        trim: true,
        maxlength: [100, 'Supplier name cannot be more than 100 characters']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true,
        maxlength: [200, 'Location cannot be more than 200 characters']
    },
    status: {
        type: String,
        enum: ['available', 'in_use', 'maintenance', 'out_of_order'],
        default: 'available',
        required: true
    },
    assignedTo: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    projectId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Project'
    },
    purchaseDate: {
        type: Date,
        required: [true, 'Purchase date is required']
    },
    warrantyExpiry: {
        type: Date
    },
    maintenanceSchedule: {
        type: Date
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [1000, 'Notes cannot be more than 1000 characters']
    }
}, {
    timestamps: true
});
ResourceSchema.index({ name: 1 });
ResourceSchema.index({ type: 1 });
ResourceSchema.index({ status: 1 });
ResourceSchema.index({ assignedTo: 1 });
ResourceSchema.index({ projectId: 1 });
exports.default = mongoose_1.default.model('Resource', ResourceSchema);
//# sourceMappingURL=Resource.js.map