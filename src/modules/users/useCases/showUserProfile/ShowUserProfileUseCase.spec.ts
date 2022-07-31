
import { verify } from 'jsonwebtoken';
import authConfig from '../../../../config/auth';

import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let user: ICreateUserDTO;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe('Show User Profile', () => {
  beforeAll(() => {
    user = {
      name: 'name',
      email: 'name@email.com',
      password: 'pass'
    }
  })

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    await createUserUseCase.execute(user);
  })

  it('should be able to show an user profile', async () => {
    const userFound = await inMemoryUsersRepository.findByEmail(user.email);
    const userProfile = await showUserProfileUseCase.execute(userFound?.id as string);
    
    expect(userProfile.email).toEqual(user.email);
  })

  it('should not be able to show an user profile with non existing user', async () => {
    expect(async () => {
      await showUserProfileUseCase.execute("invalid id");
    }).rejects.toBeInstanceOf(AppError)
  })


}) 