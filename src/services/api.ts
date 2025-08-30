import axios, { AxiosInstance, AxiosResponse } from "axios";

// Types
export interface User {
  id: number;
  staffId: string;
  name: string;
  email: string;
  clearanceLevel: "L1" | "L2" | "L3" | "L4";
  department?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface Patient {
  id: number;
  patientId: string;
  phoneNumber: string;
  name: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  address?: string;
  emergencyContact?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  allergies?: string;
  medicalHistory?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Appointment {
  id: number;
  appointmentNumber: string;
  patientId: number;
  doctorId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  reason?: string;
  notes?: string;
  patient?: Patient;
  doctor?: User;
  createdAt: string;
}

export interface MedicalRecord {
  id: number;
  appointmentId: number;
  patientId: number;
  doctorId: number;
  diagnosis: string;
  symptoms?: string;
  prescription?: string;
  treatmentPlan?: string;
  followUpDate?: string;
  followUpNotes?: string;
  vitalSigns?: string;
  labResults?: string;
  imagingResults?: string;
  notes?: string;
  appointment?: Appointment;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLog {
  id: number;
  userId: number;
  activityType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  targetUserId?: number;
  targetPatientId?: number;
  targetAppointmentId?: number;
  targetMedicalRecordId?: number;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  user?: User;
}

export interface DashboardStats {
  todayAppointments: number;
  completedToday: number;
  totalThisMonth: number;
  completedThisMonth: number;
  completionRate: number;
}

export interface LoginRequest {
  staffId: string;
  password: string;
}

export interface SignupRequest {
  staffId: string;
  name: string;
  email: string;
  password: string;
  clearanceLevel?: "L1" | "L2" | "L3" | "L4";
  department?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// API Service Class
class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || "http://localhost:9001/api",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Load token from localStorage
    this.token = localStorage.getItem("token");
    if (this.token) {
      this.setAuthToken(this.token);
    }

    // Request interceptor
    this.api.interceptors.request.use(
      config => {
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem("token", token);
    this.api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  logout() {
    this.token = null;
    localStorage.removeItem("token");
    delete this.api.defaults.headers.common["Authorization"];
    window.location.href = "/login";
  }

  // Auth endpoints
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/login",
      data
    );
    this.setAuthToken(response.data.token);
    return response.data;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post(
      "/auth/signup",
      data
    );
    this.setAuthToken(response.data.token);
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response: AxiosResponse<{ user: User }> =
      await this.api.get("/auth/profile");
    return response.data;
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.api.put(
      "/auth/change-password",
      data
    );
    return response.data;
  }

  // Patient endpoints
  async registerPatient(
    data: Omit<Patient, "id" | "patientId" | "createdAt" | "updatedAt">
  ): Promise<{ message: string; patient: Patient }> {
    const response: AxiosResponse<{ message: string; patient: Patient }> =
      await this.api.post("/patients", data);
    return response.data;
  }

  async getPatientsByPhone(
    phoneNumber: string
  ): Promise<{ patients: Patient[] }> {
    const response: AxiosResponse<{ patients: Patient[] }> = await this.api.get(
      `/patients/phone/${phoneNumber}`
    );
    return response.data;
  }

  async getPatientById(id: number): Promise<{ patient: Patient }> {
    const response: AxiosResponse<{ patient: Patient }> = await this.api.get(
      `/patients/${id}`
    );
    return response.data;
  }

  async searchPatients(query: string): Promise<{ patients: Patient[] }> {
    const response: AxiosResponse<{ patients: Patient[] }> = await this.api.get(
      `/patients/search?query=${encodeURIComponent(query)}`
    );
    return response.data;
  }

  async getPatients(): Promise<{ patients: Patient[] }> {
    const response: AxiosResponse<{ patients: Patient[] }> =
      await this.api.get("/patients");
    return response.data;
  }

  async updatePatient(
    id: number,
    data: Partial<Patient>
  ): Promise<{ message: string; patient: Patient }> {
    const response: AxiosResponse<{ message: string; patient: Patient }> =
      await this.api.put(`/patients/${id}`, data);
    return response.data;
  }

  // Appointment endpoints
  async createAppointment(data: {
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    reason?: string;
  }): Promise<{ message: string; appointment: Appointment }> {
    const response: AxiosResponse<{
      message: string;
      appointment: Appointment;
    }> = await this.api.post("/appointments", data);
    return response.data;
  }

  async getDoctorAppointments(params?: {
    date?: string;
    status?: string;
  }): Promise<{ appointments: Appointment[] }> {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append("date", params.date);
    if (params?.status) queryParams.append("status", params.status);

    const response: AxiosResponse<{ appointments: Appointment[] }> =
      await this.api.get(`/appointments/doctor?${queryParams}`);
    return response.data;
  }

  async getDoctorAppointmentsByWeek(
    startDate: string
  ): Promise<{ appointments: Appointment[] }> {
    const response: AxiosResponse<{ appointments: Appointment[] }> =
      await this.api.get(`/appointments/doctor/week?startDate=${startDate}`);
    return response.data;
  }

  async getDoctorDashboard(): Promise<{ dashboard: DashboardStats }> {
    const response: AxiosResponse<{ dashboard: DashboardStats }> =
      await this.api.get("/appointments/doctor/dashboard");
    return response.data;
  }

  async getAppointmentById(id: number): Promise<{ appointment: Appointment }> {
    const response: AxiosResponse<{ appointment: Appointment }> =
      await this.api.get(`/appointments/${id}`);
    return response.data;
  }

  async updateAppointmentStatus(
    id: number,
    data: { status: string; notes?: string }
  ): Promise<{ message: string; appointment: Partial<Appointment> }> {
    const response: AxiosResponse<{
      message: string;
      appointment: Partial<Appointment>;
    }> = await this.api.put(`/appointments/${id}/status`, data);
    return response.data;
  }

  // Medical Records endpoints
  async createMedicalRecord(data: {
    appointmentId: number;
    patientId: number;
    diagnosis: string;
    symptoms?: string;
    prescription?: string;
    treatmentPlan?: string;
    followUpDate?: string;
    followUpNotes?: string;
    vitalSigns?: string;
    labResults?: string;
    imagingResults?: string;
    notes?: string;
  }): Promise<{ message: string; medicalRecord: MedicalRecord }> {
    const response: AxiosResponse<{
      message: string;
      medicalRecord: MedicalRecord;
    }> = await this.api.post("/medical-records", data);
    return response.data;
  }

  async getMedicalRecord(
    id: number
  ): Promise<{ medicalRecord: MedicalRecord }> {
    const response: AxiosResponse<{ medicalRecord: MedicalRecord }> =
      await this.api.get(`/medical-records/${id}`);
    return response.data;
  }

  async updateMedicalRecord(
    id: number,
    data: Partial<MedicalRecord>
  ): Promise<{ message: string; medicalRecord: MedicalRecord }> {
    const response: AxiosResponse<{
      message: string;
      medicalRecord: MedicalRecord;
    }> = await this.api.put(`/medical-records/${id}`, data);
    return response.data;
  }

  async getPatientMedicalHistory(
    patientId: number
  ): Promise<{ medicalHistory: MedicalRecord[] }> {
    const response: AxiosResponse<{ medicalHistory: MedicalRecord[] }> =
      await this.api.get(`/medical-records/patient/${patientId}`);
    return response.data;
  }

  async getDoctorMedicalRecords(params?: {
    patientId?: number;
    date?: string;
  }): Promise<{ medicalRecords: MedicalRecord[] }> {
    const queryParams = new URLSearchParams();
    if (params?.patientId)
      queryParams.append("patientId", params.patientId.toString());
    if (params?.date) queryParams.append("date", params.date);

    const response: AxiosResponse<{ medicalRecords: MedicalRecord[] }> =
      await this.api.get(`/medical-records/doctor?${queryParams}`);
    return response.data;
  }

  async searchMedicalRecords(params: {
    patientId?: number;
    patientName?: string;
    diagnosis?: string;
    dateFrom?: string;
    dateTo?: string;
    doctorId?: number;
    hasFollowUp?: boolean;
    limit?: number;
    page?: number;
  }): Promise<{
    medicalRecords: MedicalRecord[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params.patientId)
      queryParams.append("patientId", params.patientId.toString());
    if (params.patientName)
      queryParams.append("patientName", params.patientName);
    if (params.diagnosis) queryParams.append("diagnosis", params.diagnosis);
    if (params.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params.dateTo) queryParams.append("dateTo", params.dateTo);
    if (params.doctorId)
      queryParams.append("doctorId", params.doctorId.toString());
    if (params.hasFollowUp !== undefined)
      queryParams.append("hasFollowUp", params.hasFollowUp.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.page) queryParams.append("page", params.page.toString());

    const response: AxiosResponse<{
      medicalRecords: MedicalRecord[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }> = await this.api.get(`/medical-records/search?${queryParams}`);
    return response.data;
  }

  async getDoctors(): Promise<{ doctors: User[] }> {
    const response: AxiosResponse<{ doctors: User[] }> =
      await this.api.get("/users/doctors");
    return response.data;
  }

  async getAllUsers(): Promise<{ users: User[] }> {
    const response: AxiosResponse<{ users: User[] }> =
      await this.api.get("/users/all");
    return response.data;
  }

  async updateUserClearance(
    userId: number,
    clearanceLevel: "L1" | "L2" | "L3" | "L4"
  ): Promise<{ message: string; user: Partial<User> }> {
    const response: AxiosResponse<{
      message: string;
      user: Partial<User>;
    }> = await this.api.put(`/users/${userId}/clearance`, {
      clearanceLevel,
    });
    return response.data;
  }

  // Activity Log endpoints
  async getMyActivityLogs(params?: {
    activityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ logs: ActivityLog[] }> {
    const queryParams = new URLSearchParams();
    if (params?.activityType)
      queryParams.append("activityType", params.activityType);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response: AxiosResponse<{ logs: ActivityLog[] }> = await this.api.get(
      `/activity-logs/my?${queryParams}`
    );
    return response.data;
  }

  async getUserActivityLogs(params?: {
    userId?: number;
    activityType?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{ logs: ActivityLog[] }> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append("userId", params.userId.toString());
    if (params?.activityType)
      queryParams.append("activityType", params.activityType);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response: AxiosResponse<{ logs: ActivityLog[] }> = await this.api.get(
      `/activity-logs/users?${queryParams}`
    );
    return response.data;
  }

  async getAuditLogs(params?: {
    startDate?: string;
    endDate?: string;
    severity?: string;
    limit?: number;
  }): Promise<{ logs: ActivityLog[] }> {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.severity) queryParams.append("severity", params.severity);
    if (params?.limit) queryParams.append("limit", params.limit.toString());

    const response: AxiosResponse<{ logs: ActivityLog[] }> = await this.api.get(
      `/activity-logs/audit?${queryParams}`
    );
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
