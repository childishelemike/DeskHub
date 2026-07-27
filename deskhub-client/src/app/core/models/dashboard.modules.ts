export interface Office {
  id: number;
  name: string;
  address: string;
  city: string;
  companyId: number;
  companyName: string;
  openingTime: string;
  closingTime: string;
  workingDays: string;
}

export interface User {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
  companyId: number;
  companyName: string;
  officeId: number | null;
  officeName: string | null;
  createdAt: string;
}

export interface Space {
  id: number;
  name: string;
  capacity: number;
  isActive: boolean;
  positionX: number;
  positionY: number;
  officeId: number;
  officeName: string;
  spaceTypeId: number;
  spaceTypeName: string;
}

export interface SpaceType {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface Booking {
  id: number;
  userId: number;
  userName: string;
  spaceId: number;
  spaceName: string;
  officeName: string;
  startTime: string;
  endTime: string;
  status: string;
  createdAt: string;
}
