import { Connection, createConnection } from "typeorm"
import request from 'supertest';
import { verify } from 'jsonwebtoken';

import authConfig from '../../../../config/auth';
import { app } from "../../../../app";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";

let connection: Connection;
let user: ICreateUserDTO;

describe('e2e Authenticate User Controller', () => {
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
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  })

  it('should be able to authenticate an user', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: user.password
    });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(verify(response.body.token, authConfig.jwt.secret));

  });

  it('should not be able to authenticate an invalid user', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: 'invalid email',
        password: user.password
      });

    expect(response.status).toBe(401);
  });
  
  it('should not be able to authenticate an invalid password', async () => {
    const response = await request(app)
      .post('/api/v1/sessions')
      .send({
        email: user.email,
        password: 'invalid password',
      });

    expect(response.status).toBe(401);
  });
}) 