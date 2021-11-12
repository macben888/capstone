package capstone.backend.model.db.order;

import capstone.backend.model.db.contact.Supplier;
import lombok.*;
import lombok.experimental.SuperBuilder;

import javax.persistence.Entity;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

@ToString
@AllArgsConstructor
@Entity
@SuperBuilder
@Table(name = "supplier_orders")
public class OrderToSupplier extends Order {

    public OrderToSupplier() {
        super();
    }

    @ManyToOne
    private Supplier supplier;

    public Supplier getSupplier() {
        return this.supplier;
    }

    public void setSupplier(Supplier supplier) {
        this.supplier = supplier;
    }

    @Override
    public boolean equals(Object o) {
        return super.equals(o);
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }
}
