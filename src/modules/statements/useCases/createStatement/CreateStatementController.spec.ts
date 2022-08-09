import { Connection, createConnection } from "typeorm"
import request from 'supertest';

import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

let connection: Connection;
let user: ICreateUserDTO;
let token : string;

describe('e2e Create Statement Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: 'name',
      email: 'name@email.com',
      password: 'pass'
    }
    const test = await request(app)
      .post('/api/v1/users')
      .send(user);
    
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
    });

    token = response.body.token;
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create an deposit statement', async () => {
    const response = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: 'deposit statement',
      });
    expect(response.body).toHaveProperty('id');
    expect(response.status).toBe(201);
  });

  it('should be able to create an withdraw statement', async () => {
    const response = await request(app)
      .post('/api/v1/statements/withdraw')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: 'withdraw statement',
      });
      expect(response.body).toHaveProperty('id');
      expect(response.status).toBe(201);
  });

}) 