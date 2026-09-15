import { OrderAggregate } from '../src/modules/commerce/domain/order.aggregate';
describe('OrderAggregate', () => {
  it('autorise le cycle nominal', () => { const order = new OrderAggregate('1', 'pending'); order.transitionTo('inProgress'); order.transitionTo('completed'); order.transitionTo('delivered'); expect(order.status).toBe('delivered'); });
  it('interdit de livrer une commande en attente', () => { expect(() => new OrderAggregate('1', 'pending').transitionTo('delivered')).toThrow('Transition pending -> delivered interdite'); });
});
