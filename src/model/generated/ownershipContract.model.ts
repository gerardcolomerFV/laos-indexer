import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Asset} from "./asset.model"

@Entity_()
export class OwnershipContract {
    constructor(props?: Partial<OwnershipContract>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    laosContract!: string

    @OneToMany_(() => Asset, e => e.ownershipContract)
    assets!: Asset[]
}
