import { Test, TestingModule } from '@nestjs/testing';
import { account } from '@prisma/client';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaService } from 'src/modules/common/prisma/prisma.service';

import { AccountsController } from '../accounts.controller';
import { AccountsService } from '../accounts.service';
import { AccountInterestsService } from '../account-interests.service';
import { SecureAccountDTO } from '../dtos/secure-account-dto';
import { UpdateAccountDTO } from '../dtos/update-account.dto';

describe('AccountsController', () => {
	let controller: AccountsController;
	let accountsService: DeepMockProxy<AccountsService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [AccountsController],
			providers: [
				{
					provide: AccountsService,
					useValue: mockDeep<AccountsService>(),
				},
				{
					provide: AccountInterestsService,
					useValue: mockDeep<AccountInterestsService>(),
				},
				{
					provide: PrismaService,
					useValue: mockDeep<PrismaService>(),
				},
			],
		}).compile();

		controller = module.get<AccountsController>(AccountsController);
		accountsService =
			module.get<DeepMockProxy<AccountsService>>(AccountsService);

		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('should call accountsService.findAll on findAll()', async () => {
		const pagination = { limit: 10, offset: 0 };
		const accounts = [{ id: '1' }];

		accountsService.findAll.mockResolvedValue(accounts as account[]);

		const result = await controller.findAll(pagination);

		expect(accountsService.findAll).toHaveBeenCalledWith(pagination);
		expect(result).toEqual(accounts);
	});

	it('should call accountsService.findOneById on findOneById()', async () => {
		const user = { id: '1' };

		accountsService.findOneById.mockResolvedValue(user as SecureAccountDTO);

		const result = await controller.findOneById('1');

		expect(accountsService.findOneById).toHaveBeenCalledWith('1');
		expect(result).toEqual(user);
	});

	it('should call accountsService.update on update()', async () => {
		const dto = {
			name: 'Updated',
			password: '123456',
		};

		const updatedAccount = {
			id: '1',
			name: 'Updated',
		};

		accountsService.update.mockResolvedValue(updatedAccount as account);

		const result = await controller.update('1', dto as UpdateAccountDTO);

		expect(accountsService.update).toHaveBeenCalledWith('1', dto);
		expect(result).toEqual(updatedAccount);
	});

	it('should call accountsService.remove on remove()', async () => {
		const user = { id: '1' };

		accountsService.remove.mockResolvedValue(user as account);

		const result = await controller.remove('1');

		expect(accountsService.remove).toHaveBeenCalledWith('1');
		expect(result).toEqual(user);
	});
});
