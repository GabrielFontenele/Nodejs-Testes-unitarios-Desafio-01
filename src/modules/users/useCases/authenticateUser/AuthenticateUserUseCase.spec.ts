
import { verify } from 'jsonwebtoken';
import authConfig from '../../../../config/auth';

import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let user: ICreateUserDTO;
let authenticateUserUseCase: AuthenticateUserUseCase;

describe('Authenticate User', () => {
  beforeAll(() => {
    user = {
      name: 'name',
      email: 'name@email.com',
      password: 'pass'
    }
  })

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    await createUserUseCase.execute(user);
  })

  it('should be able to authenticate an user', async () => {

    const response = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(response).toHaveProperty('token');
    expect(response.user.email).toEqual(user.email);
    expect(verify(response.token, authConfig.jwt.secret));
  })

  it('should not be able to authenticate with non existing user', async () => {
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: "fail email",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(AppError)
  })

  it('should not be able to authenticate with wrong password', async () => {
    await expect(async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: 'fail password',
      });
    }).rejects.toBeInstanceOf(AppError)
  })

}) 