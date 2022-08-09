import { Connection, createConnection } from "typeorm"
import request from 'supertest';

import { app } from "../../../../app";
import { ICreateUserDTO } from "./ICreateUserDTO";

let connection: Connection;
let user: ICreateUserDTO;

describe('e2e Create User Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    user = {
      name: 'name',
      email: 'name@email.com',
      password: 'pass'
    }
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to create an user', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send(user);

    expect(response.status).toBe(201);
  });

  it('should not be able to create an user if inserted email already exists', async () => {
    const response = await request(app)
      .post('/api/v1/users')
      .send(user);

    expect(response.status).toBe(400);
  });
}) 