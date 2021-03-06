package name.gyger.jmoney.account

import com.fasterxml.jackson.annotation.JsonIgnore
import name.gyger.jmoney.category.Category
import name.gyger.jmoney.session.Session
import javax.persistence.*

@Entity
class Account : Category() {
    var bank: String? = null
    var accountNumber: String? = null
    var currencyCode: String? = null
    var startBalance: Long = 0
    var minBalance: Long? = null
    var abbreviation: String? = null
    @Column(length = 1000) var comment: String? = null

    @JsonIgnore
    @OneToMany(mappedBy = "account", cascade = arrayOf(CascadeType.REMOVE))
    var entries: MutableList<Entry> = mutableListOf()

    @JsonIgnore
    @ManyToOne
    var session: Session? = null

    init {
        type = Category.Type.ACCOUNT
    }
}