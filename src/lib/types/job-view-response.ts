export type JobViewResponse = {
  job: {
    id: string;
    title: string;
    description: string;
    country: string;
    salaryMin: number;
    salaryMax: number;
    status: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
    workType: string;
    views: number;
  };
  company: {
    id: string;
    name: string;
    description: string;
    website: string | null;
    industry: string;
    size: string;
    address: string;
    profilePicture: string | null;
    views: number;
    email: string | null;
    userId: string | null;
  };
  applicationCount: number;
  userRole: string | null;
};
