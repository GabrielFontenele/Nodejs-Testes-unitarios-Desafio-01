import { Connection, createConnection } from "typeorm"
import request from 'supertest';

import { app } from "../../../../app";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let connection: Connection;
let user: ICreateUserDTO;
let token : string;

describe('e2e Show User Profile Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: 'name',
      email: 'name@email.com',
      password: 'pass'
    }
    await request(app)
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

  it('should be able to show an user profile ', async () => {
    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer ${token}`,
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to show an user profile with a invalid token', async () => {
    const response = await request(app)
      .get('/api/v1/profile')
      .set({
        Authorization: `Bearer invalidToken`,
      });

    expect(response.status).toBe(401);
  });
}) 