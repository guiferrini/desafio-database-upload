import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export default class AddCategoryIdToTransactions1588624184231
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      // 1° parametro tabela, 2° a nova coluna
      'transactions',
      new TableColumn({
        name: 'category_id',
        type: 'uuid',
        isNullable: true,
      }),
    );

    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        columnNames: ['category_id'], // nome da coluna q esta na tabela transactions
        referencedColumnNames: ['id'], // nome da coluna q esta referenciada na tabelada da category pelo id
        referencedTableName: 'categories', // qual tabela estamos referenciando
        name: 'TransactionCategory', // nome da chave estrangeira
        onUpdate: 'CASCADE', // sempre q atualizar em uma tabela atualiza na outra
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'TransactionCategory'); // 1°tabela 2° ForeignKey
    await queryRunner.dropColumn('transactions', 'category_id'); // 1°tabela, 2°Column
  }
}
