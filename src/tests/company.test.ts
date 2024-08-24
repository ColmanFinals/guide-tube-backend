import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createCompany, updateCompany, getAllCompanies, getCompanyById, addUserToCompany, removeUserFromCompany, addAdminToCompany, removeAdminFromCompany, deleteCompany } from '../controllers/companyController';
import Company from '../models/companyModel';
import User from '../models/userModel';
import { Request, Response } from 'express';

interface MockRequestOptions {
  params?: any;
  body?: any;
  user?: any;
}

const mockRequest = (options: MockRequestOptions = {}): Partial<Request> => {
  return {
    params: options.params || {},
    body: options.body || {},
    user: options.user || { _id: new mongoose.Types.ObjectId().toString() },
    get: jest.fn((name: string) => {
      return undefined;
    }),
    header: jest.fn((name: string) => {
      return undefined;
    }),
    accepts: jest.fn(),
    acceptsCharsets: jest.fn(),
  } as Partial<Request>;
};

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Partial<Response>;
};

const demoUser = {
  _id: new mongoose.Types.ObjectId('66b63b9147edcc1180ea5d06'),  // Explicitly setting the ID for testing purposes
  fullName: "demoUser",
  username: "demoUsername",
  password: "password123",
  email: "demo@example.com"
};

describe('Company Controller Tests', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.dropDatabase();
    jest.clearAllMocks();
    await User.create(demoUser);
  });

  afterEach(async () => {
    await mongoose.connection.dropDatabase();
    jest.restoreAllMocks();
  });

  it('should create a company successfully', async () => {
    const req = mockRequest({
      body: { name: 'Test Company', logo: 'test-logo.png', user: { _id: new mongoose.Types.ObjectId().toString() } }
    });
    const res = mockResponse();
    const companiesListBefore = await Company.find()
    expect(companiesListBefore.length).toBe(0)
    await createCompany(req as Request, res as Response);
    const companiesListAfter = await Company.find()
    expect(companiesListAfter.length).toBe(1)
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  it('should update a company successfully', async () => {
    const company = await Company.create({ name: 'Old Name', logo: 'old-logo.png', creator: demoUser._id, users: [], admin: [], guides: [] });
    const req = mockRequest({
      body: { companyId: company._id.toString(), name: 'New Name', logo: 'new-logo.png', creator: demoUser._id, users: [], admin: [], guides: [] }
    });
    const res = mockResponse();

    await updateCompany(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it('getAllCompanies returns empty array when no companies exist', async () => {
    const req = mockRequest();
    const res = mockResponse();

    await getAllCompanies(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ companies: [] });
  });

  it('should get a company by ID', async () => {
    const company = await Company.create({ name: 'Test Company', logo: 'test-logo.png', creator: demoUser._id, users: [], admins: [], guides: [] });
    const req = mockRequest({ params: { companyId: company._id.toString() } });
    const res = mockResponse();

    jest.spyOn(Company, 'populate').mockResolvedValueOnce({} as any);
    await getCompanyById(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalled();
  });

  it('should delete a company', async () => {
    const company = await Company.create({ name: 'Test Company', logo: 'test-logo.png', creator: demoUser._id });
    const req = mockRequest({ params: { companyId: company._id.toString() } });
    const res = mockResponse();

    await deleteCompany(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Company deleted successfully" });
  });
  it('should handle not found company when updating', async () => {
    const req = mockRequest({
      body: { companyId: new mongoose.Types.ObjectId().toString(), name: 'New Name', logo: 'new-logo.png', creator: demoUser._id, users: [], admin: [], guides: [] }
    });
    const res = mockResponse();

    await updateCompany(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: "Company not found" });
  });

  it('should properly convert a user to an admin', async () => {
    const company = await Company.create({
      name: 'Test Company', 
      logo: 'test-logo.png', 
      creator: demoUser._id, 
      users: [demoUser._id], 
      admins: []
    });
  
    const req = mockRequest({
      body: { companyId: company._id.toString(), username: demoUser.username }
    });
    const res = mockResponse();
  
    await addAdminToCompany(req as Request, res as Response);
    const updatedCompany = await Company.findById(company._id)
    console.log(updatedCompany)
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
    expect(updatedCompany?.admins.includes(demoUser._id)).toBe(true); 
    expect(updatedCompany?.users.includes(demoUser._id)).toBe(false); 
  });
  
  

  it('should handle removing a non-existing admin gracefully', async () => {
    const company = await Company.create({ name: 'Test Company', logo: 'test-logo.png', creator: demoUser._id, admins: [] });
    const req = mockRequest({
      body: { companyId: company._id.toString(), adminId: new mongoose.Types.ObjectId().toString() }
    });
    const res = mockResponse();

    await removeAdminFromCompany(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(200); 
  });


  it('should return an error if no company ID is provided for deletion', async () => {
    const req = mockRequest({ params: {} });
    const res = mockResponse();

    await deleteCompany(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Company ID is required" });
  });

  // Handle database error during fetchAllCompanies
  it('should handle errors during fetching all companies', async () => {
    jest.spyOn(Company, 'find').mockImplementationOnce(() => {
      throw new Error("Database failure");
    });
    const req = mockRequest();
    const res = mockResponse();

    await getAllCompanies(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
  });

});
