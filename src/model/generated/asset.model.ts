import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, BigIntColumn as BigIntColumn_, StringColumn as StringColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {OwnershipContract} from "./ownershipContract.model"
import {Transfer} from "./transfer.model"

@Entity_()
export class Asset {
    constructor(props?: Partial<Asset>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => OwnershipContract, {nullable: true})
    ownershipContract!: OwnershipContract

    @BigIntColumn_({nullable: false})
    tokenId!: bigint

    @StringColumn_({nullable: false})
    owner!: string

    @OneToMany_(() => Transfer, e => e.asset)
    transfers!: Transfer[]
}
