import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository"
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let inMemoryUsersRepository: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;
let user: ICreateUserDTO;

describe('Create User', () => {
  beforeAll(() => {
    user = {
      name: 'name',
      email: 'name@email.com',
      password: 'pass'
    }
  })

  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  })

  it('should be able to create an user', async () => {
    await createUserUseCase.execute(user);

    const createdUser = await inMemoryUsersRepository.findByEmail(user.email);

    expect(createdUser).toHaveProperty('id');
  })

  it('should not be able to create an user if inserted email already exists', async () => {
    await createUserUseCase.execute(user);

    expect(async () => {
      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(AppError)
  })
}) 