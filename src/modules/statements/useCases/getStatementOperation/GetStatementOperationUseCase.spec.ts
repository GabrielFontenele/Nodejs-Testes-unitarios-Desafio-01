import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { ICreateUserDTO } from '../../../users/useCases/createUser/ICreateUserDTO';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;
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
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    const userFound = await createUserUseCase.execute(user);
    user_id = userFound.id ?? '';
  })

  it('should be able to get statement', async () => {
    const deposit = 100;
    const statement = await createStatementUseCase.execute({
      user_id: user_id,
      amount: deposit,
      description: 'deposit statement',
      type: 'deposit' as OperationType
    });


    const response = await getStatementOperationUseCase.execute({
      user_id,
      statement_id: statement.id ?? ''
    })

    expect(response).toHaveProperty('id');
    expect(response.id).toEqual(statement.id);
  })
  
  it('should not be able to get balance with a invalid user', async () => {
    await expect(async () => {
      const statement = await createStatementUseCase.execute({
        user_id: user_id,
        amount: 100,
        description: 'deposit statement',
        type: 'deposit' as OperationType
      });
      await getStatementOperationUseCase.execute({
        user_id: "invalid user",
        statement_id: statement.id ?? ''
      })
  
    }).rejects.toBeInstanceOf(AppError)
  })
  
  it('should not be able to get balance with a invalid statement id', async () => {
    await expect(async () => {
      await getStatementOperationUseCase.execute({
        user_id,
        statement_id: 'invalid statement id'
      })
    }).rejects.toBeInstanceOf(AppError)
  })
}) 