import { getCustomRepository, getRepository, In } from 'typeorm';
import csvParse from 'csv-parse'; // manipula o arquivo CSV
import fs from 'fs'; // abre e le o arquivo

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface CSVTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filepath: string): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoriesRepository = getRepository(Category);

    const contactsReadStream = fs.createReadStream(filepath); // arquivo q vai estar lendo o filepath

    const parsers = csvParse({
      // instanciando o csvParse..
      from_line: 2, // 1° linha comes da colunas...
    });

    const parseCSV = contactsReadStream.pipe(parsers); // 'pipe' le as linhas conforme disposição, de forma continua

    // 1° salvamos td nesse Array e depois enviampos p o BD e assim é salvo td de uma vez,
    // salvar 1 por 1 abre e fecha o bd, não é efetivo, mto tempo de precessamento
    const transactions: CSVTransaction[] = [];
    const categories: string[] = [];

    // desestruturando as linhas e nomeando.
    // Desestruturando cada celula que será uma string
    // e retorna com os nomem e um espaço entre eles
    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );

      // verificando se cada variável esta chegando corretamente, caso contrario n inserir
      if (!title || !type || !value) return;

      categories.push(category);

      transactions.push({ title, type, value, category });
    });

    // para 'executar' o parseCSV, ele é sincrono, entao n lé/recuperou o valor os 'pushs'
    // recuperando o valor...
    await new Promise(resolve => parseCSV.on('end', resolve));

    // Busca pelas categories existentes
    // 'in' busca se alguma das categorias buscadas esta dentro do BD
    const existenCategories = await categoriesRepository.find({
      where: {
        title: In(categories),
      },
    });

    const existenCategoriesTitle = existenCategories.map(
      (category: Category) => category.title,
    );

    // Filtrando todas as categorias que temos...
    // 2° filter, retira os duplicados
    const addCategoryTitle = categories
      .filter(category => !existenCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    // colocando as categorias dentro do BD
    const newCategories = categoriesRepository.create(
      addCategoryTitle.map(title => ({
        title,
      })),
    );

    await categoriesRepository.save(newCategories);

    const finalCategories = [...newCategories, ...existenCategories];

    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    // excluido o arquivo depois dele rodar
    await fs.promises.unlink(filepath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
