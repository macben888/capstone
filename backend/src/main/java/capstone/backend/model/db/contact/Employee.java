package capstone.backend.models.db.contact;

import capstone.backend.models.UserRoles;
import lombok.*;

import javax.persistence.ElementCollection;
import javax.persistence.Entity;
import javax.persistence.Table;
import java.util.List;

@Getter
@Setter
@ToString
@RequiredArgsConstructor
@AllArgsConstructor
//@NoArgsConstructor
@Entity
@Table(name = "employees")
public class Employee extends Contact {

    private String password;
    @ElementCollection
    private List<UserRoles> roles;

    @Override
    public boolean equals(Object o) {
        return super.equals(o);
    }

    @Override
    public int hashCode() {
        return super.hashCode();
    }
}
