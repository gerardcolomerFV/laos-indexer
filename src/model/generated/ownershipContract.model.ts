import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, Index as Index_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {Asset} from "./asset.model"

@Entity_()
export class OwnershipContract {
    constructor(props?: Partial<OwnershipContract>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @StringColumn_({nullable: true})
    laosContract!: string | undefined | null

    @OneToMany_(() => Asset, e => e.ownershipContract)
    assets!: Asset[]
}
