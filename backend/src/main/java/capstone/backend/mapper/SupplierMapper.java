package capstone.backend.mapper;

import capstone.backend.model.db.contact.Supplier;
import capstone.backend.model.dto.contact.SupplierDTO;

import java.util.List;

public class SupplierMapper {

    public static Supplier mapSupplier(SupplierDTO supplier){
        return Supplier
                .builder()
                .id(supplier.getId())
                .firstName(supplier.getFirstName())
                .lastName(supplier.getLastName())
                .products(supplier
                        .getProducts()
                        .stream()
                        .map(ProductMapper::mapProduct)
                        .toList())
                .orders(List.of())
                .orderDay(supplier.getOrderDay())
                .build();
    }
    public static SupplierDTO mapSupplier(Supplier supplier){
        return SupplierDTO
                .builder()
                .id(supplier.getId())
                .firstName(supplier.getFirstName())
                .lastName(supplier.getLastName())
                .products(supplier
                        .getProducts()
                        .stream()
                        .map(ProductMapper::mapProductWithDetails)
                        .toList())
                .orders(List.of())
                .orderDay(supplier.getOrderDay())
                .build();
    }
}
