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
const ProjectSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Project name is required'],
        trim: true,
        maxlength: [100, 'Project name cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: false,
        trim: true,
        maxlength: [500, 'Description cannot be more than 500 characters'],
        default: 'No description provided'
    },
    client: {
        type: String,
        required: [true, 'Client name is required'],
        trim: true,
        maxlength: [100, 'Client name cannot be more than 100 characters']
    },
    location: {
        type: String,
        required: false,
        trim: true,
        maxlength: [200, 'Location cannot be more than 200 characters'],
        default: 'Not specified'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function (value) {
                return value > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    budget: {
        type: Number,
        required: [true, 'Budget is required'],
        min: [0, 'Budget cannot be negative']
    },
    status: {
        type: String,
        enum: ['planning', 'in_progress', 'on_hold', 'completed', 'cancelled'],
        default: 'planning',
        required: true
    },
    progress: {
        type: Number,
        min: [0, 'Progress cannot be less than 0'],
        max: [100, 'Progress cannot be more than 100'],
        default: 0
    },
    projectManager: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Project manager is required']
    },
    team: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    gpsLocation: {
        latitude: { type: Number },
        longitude: { type: Number },
        accuracy: { type: Number },
        address: { type: String }
    },
    siteVisits: [{
            visitType: {
                type: String,
                enum: ['site_visit', 'inspection', 'delivery', 'maintenance'],
                required: true
            },
            location: {
                latitude: { type: Number, required: true },
                longitude: { type: Number, required: true },
                accuracy: { type: Number, required: true },
                address: { type: String }
            },
            timestamp: { type: Date, default: Date.now },
            notes: { type: String },
            photos: [{ type: String }]
        }]
}, {
    timestamps: true
});
ProjectSchema.index({ name: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ projectManager: 1 });
ProjectSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('Project', ProjectSchema);
//# sourceMappingURL=Project.js.map