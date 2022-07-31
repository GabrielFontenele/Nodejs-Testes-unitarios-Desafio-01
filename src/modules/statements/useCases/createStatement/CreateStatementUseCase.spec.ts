import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let user: ICreateUserDTO;
let user_id: string;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeAll(() => {
    user = {
      name: 'name',
      email: 'name@email.com',
      password: 'pass'
    }
  })

  beforeEach(async () => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    const userFound = await createUserUseCase.execute(user);
    user_id = userFound.id ?? '';
  })

  it('should be able to create an deposit statement', async () => {
    
    const response = await createStatementUseCase.execute({
      user_id: user_id,
      amount: 100,
      description: 'deposit statement',
      type: 'deposit' as OperationType
    });
    expect(response).toHaveProperty('id');
  })

  it('should be able to create an withdraw statement', async () => {
    await createStatementUseCase.execute({
      user_id: user_id,
      amount: 100,
      description: 'deposit statement',
      type: 'deposit' as OperationType
    });

    const response = await createStatementUseCase.execute({
      user_id: user_id,
      amount: 50,
      description: 'withdraw statement',
      type: 'withdraw' as OperationType
    });

    expect(response).toHaveProperty('id');
  })

  it('should not be able to create an statement with invalid user', async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: "invalid id",
        amount: 100,
        description: 'deposit statement',
        type: 'deposit' as OperationType
      });
    }).rejects.toBeInstanceOf(AppError)
  })

  
  it('should not be able to create an withdraw statement with insufficient funds', async () => {
    await expect(async () => {
      await createStatementUseCase.execute({
        user_id: user_id,
        amount: 100,
        description: 'withdraw statement',
        type: 'withdraw' as OperationType
      });
    }).rejects.toBeInstanceOf(AppError)
  })
}) 