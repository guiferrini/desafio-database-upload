import { getCustomRepository, TransactionRepository } from 'typeorm';

import AppError from '../errors/AppError';

// import Transaction from '../models/Transaction';
import Transactionrepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<void> {
    // Buscar do BD se ID solicitado existe p deletar
    const transactionRepositories = getCustomRepository(Transactionrepository);

    const transaction = await transactionRepositories.findOne(id);

    if (!transaction) {
      throw new AppError('Transactions dont exist');
    }

    // não é necessario nenhum retorno, esta sendo feito um delete...
    await transactionRepositories.remove(transaction);
  }
}

export default DeleteTransactionService;
