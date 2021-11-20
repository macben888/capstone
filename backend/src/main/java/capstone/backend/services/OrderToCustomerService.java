package capstone.backend.services;

import capstone.backend.mapper.OrderToCustomerMapper;
import capstone.backend.model.db.order.OrderItem;
import capstone.backend.model.db.order.OrderToCustomer;
import capstone.backend.model.dto.order.OrderItemDTO;
import capstone.backend.model.dto.order.OrderToCustomerDTO;
import capstone.backend.repo.OrderToCustomerRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import static capstone.backend.mapper.OrderItemMapper.mapOrderItem;
import static capstone.backend.mapper.OrderToCustomerMapper.mapOrder;
import static capstone.backend.model.enums.OrderToCustomerStatus.OPEN;
import static capstone.backend.model.enums.OrderToCustomerStatus.PAID;


@RequiredArgsConstructor
@Service
public class OrderToCustomerService {

    private final OrderToCustomerRepo repo;
    private final ProductService productService;
    private final OrderItemService orderItemService;

    public List<OrderToCustomerDTO> getAllOrders() {
        return repo.findAll()
                .stream()
                .map(OrderToCustomerMapper::mapOrder)
                .toList();
    }

    public List<OrderToCustomerDTO> getAllOpenOrders() {
        return repo.findAllByStatus(OPEN)
                .stream()
                .map(OrderToCustomerMapper::mapOrder)
                .toList();
    }

    public OrderToCustomerDTO createEmptyOrder() {
        return mapOrder(repo.save(new OrderToCustomer(OPEN)));
    }

    public OrderToCustomerDTO addItemsToOrder(Long orderId, OrderItemDTO orderItem, OrderToCustomerDTO orderToCustomer) throws IllegalArgumentException {
        OrderToCustomer openOrder = validateOrderWhenAddItems(orderId, orderItem);
        OrderItemDTO orderItemWithUpdatedAmount = orderItemService.addItemToOrderOrUpdateQuantity(orderItem, orderToCustomer);
        productService.substractStockWhenAddingItemToBill(mapOrderItem(orderItem));
        updateAmountOnBill(openOrder, mapOrderItem(orderItemWithUpdatedAmount));
        return mapOrder(repo.save(openOrder));
    }

    private void updateAmountOnBill(OrderToCustomer order, OrderItem orderItem) {
if(!order.getOrderItems().contains(orderItem)){
    List<OrderItem> itemsOnBill = new ArrayList<>(order.getOrderItems());
    itemsOnBill.add(orderItem);
    order.setOrderItems(itemsOnBill);
}
        //        order.setOrderItems(
//                order
//                        .getOrderItems()
//                        .stream()
//                        .map(oldOrderItem -> Objects.equals(oldOrderItem.getId(), orderItem.getId()) ? mapOrderItem(orderItem) : oldOrderItem)
//                        .toList());
    }

    public OrderToCustomerDTO removeItemsFromOrder(Long orderId, OrderItemDTO orderItem, OrderToCustomerDTO order) throws IllegalArgumentException, EntityNotFoundException {
        OrderToCustomer openOrder = validateOrderWhenRemoveItems(orderItem, order);
        orderItemService.reduceQuantityOfOrderItem(orderItem, order);
        productService.resetAmountInStockWhenRemovingFromBill(mapOrderItem(orderItem));
//        reduceAmountOnBillOrDeleteIfNull(openOrder, orderItemWithItemsRemoved);
        return mapOrder(repo.save(openOrder));
    }

    private void reduceAmountOnBillOrDeleteIfNull(OrderToCustomer order, OrderItemDTO orderItem) {
        order.setOrderItems(
                order
                        .getOrderItems()
                        .stream()
                        .map(oldOrderItem -> {
                            if (Objects.equals(oldOrderItem.getId(), orderItem.getId())) {
                                return orderItem.getQuantity() > 0 ? mapOrderItem(orderItem) : null;
                            }
                            return oldOrderItem;
                        })
                        .filter(Objects::nonNull)
                        .toList());
    }

    public OrderToCustomerDTO cashoutOrder(OrderToCustomerDTO orderToCustomer) {
        OrderToCustomer openOrder = repo.findById(orderToCustomer.getId()).orElseThrow(EntityNotFoundException::new);
        if (orderAlreadyPaid(openOrder)) {
            throw new IllegalArgumentException("This order has already been cashed out!");
        }
        openOrder.setStatus(PAID);
        return mapOrder(repo.save(openOrder));
    }

    private OrderToCustomer validateOrderWhenAddItems(Long orderId, OrderItemDTO orderItem) {
        if (!orderExists(orderId)) {
            throw new EntityNotFoundException("You're trying to add to an order that doesn't exist");
        }
        if (orderAlreadyPaid(orderId)) {
            throw new IllegalArgumentException("This order has already been cashed out!");
        }
        if (!productService.productExists(orderItem.getProduct())) {
            throw new IllegalArgumentException("You're trying to add a product that doesn't exist");
        }
        return repo.findById(orderId).orElseThrow(EntityNotFoundException::new);
    }

    private OrderToCustomer validateOrderWhenRemoveItems(OrderItemDTO orderItem, OrderToCustomerDTO order) {
        if (!orderExists(order)) {
            throw new EntityNotFoundException("You're trying to remove from an order that doesn't exist");
        }
        if (orderAlreadyPaid(order)) {
            throw new IllegalArgumentException("This order has already been cashed out!");
        }
        if (orderItemService.itemAlreadyOnOrder(orderItem, order).isEmpty()) {
            throw new IllegalArgumentException("The item you're trying to remove is not on the order");
        }
        if (!productService.productExists(orderItem.getProduct())) {
            throw new IllegalArgumentException("You're trying to remove a product that doesn't exist");
        }
        orderHasLessItemsThanTryingToReduce(orderItem, order);
        return repo.findById(order.getId()).orElseThrow(EntityNotFoundException::new);
    }

    private boolean orderExists(OrderToCustomerDTO order) {
        return (order.getId() != null && repo.existsById(order.getId()));
    }

    private boolean orderExists(Long orderId) {
        return (orderId != null && repo.existsById(orderId));
    }

    private boolean orderAlreadyPaid(OrderToCustomerDTO order) {
        OrderToCustomer existingOrder = repo.findById(order.getId()).orElseThrow(EntityNotFoundException::new);
        return existingOrder.getStatus() == PAID;
    }

    private boolean orderAlreadyPaid(OrderToCustomer order) {
        OrderToCustomer existingOrder = repo.findById(order.getId()).orElseThrow(EntityNotFoundException::new);
        return existingOrder.getStatus() == PAID;
    }

    private boolean orderAlreadyPaid(Long orderId) {
        OrderToCustomer existingOrder = repo.findById(orderId).orElseThrow(EntityNotFoundException::new);
        return existingOrder.getStatus() == PAID;
    }

    private void orderHasLessItemsThanTryingToReduce(OrderItemDTO orderItem, OrderToCustomerDTO order) {
        order.getOrderItems().forEach(itemOnOrder -> {
            if (itemOnOrder.equals(orderItem) && itemOnOrder.getQuantity() < orderItem.getQuantity()) {
                throw new IllegalArgumentException("It's not possible to remove more items than are on the order");
            }
        });

    }

}



