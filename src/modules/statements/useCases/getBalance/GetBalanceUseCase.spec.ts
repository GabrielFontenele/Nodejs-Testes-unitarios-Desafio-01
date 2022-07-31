import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;
let user: ICreateUserDTO;
let user_id: string;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get Balance', () => {
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
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    const userFound = await createUserUseCase.execute(user);
    user_id = userFound.id ?? '';
  })

  it('should be able to get balance', async () => {
    const deposit = 100;
    const withdraw = 40;
    await createStatementUseCase.execute({
      user_id: user_id,
      amount: deposit,
      description: 'deposit statement',
      type: 'deposit' as OperationType
    });

    await createStatementUseCase.execute({
      user_id: user_id,
      amount: withdraw,
      description: 'withdraw statement',
      type: 'withdraw' as OperationType
    });

    const response = await getBalanceUseCase.execute({user_id})

    expect(response).toHaveProperty('statement');
    expect(response).toHaveProperty('balance');
    expect(response.balance).toEqual(deposit - withdraw);
  })
  
  it('should not be able to get balance with a invalid user', async () => {
    await expect(async () => {
      await getBalanceUseCase.execute({ user_id : "invalid id" });
    }).rejects.toBeInstanceOf(AppError)
  })

}) 