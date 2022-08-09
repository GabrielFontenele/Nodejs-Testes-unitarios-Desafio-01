import { Connection, createConnection } from "typeorm"
import request from 'supertest';

import { app } from "../../../../app";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";

let connection: Connection;
let user: ICreateUserDTO;
let token : string;

describe('e2e Get Statement Operation Controller', () => {
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

  it('should be able to bet balance', async () => {
    const responseDeposit = await request(app)
      .post('/api/v1/statements/deposit')
      .set({
        Authorization: `Bearer ${token}`,
      })
      .send({
        amount: 100,
        description: 'deposit statement',
      });
    const response = await request(app)
      .get('/api/v1/statements/'+ responseDeposit.body.id)
      .set({
        Authorization: `Bearer ${token}`,
      })
    expect(response.body).toHaveProperty('id');
    expect(response.body.amount).toEqual("100.00");
    expect(response.body.id).toEqual(responseDeposit.body.id);
    expect(response.status).toBe(200);
  });
}) 