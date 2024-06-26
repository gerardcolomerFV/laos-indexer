import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, BigIntColumn as BigIntColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"
import {LaosContract} from "./laosContract.model"
import {Metadata} from "./metadata.model"

@Entity_()
export class LaosAsset {
    constructor(props?: Partial<LaosAsset>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => LaosContract, {nullable: true})
    laosContract!: LaosContract

    @BigIntColumn_({nullable: false})
    tokenId!: bigint

    @StringColumn_({nullable: false})
    initialOwner!: string

    @Index_()
    @ManyToOne_(() => Metadata, {nullable: true})
    metadata!: Metadata | undefined | null
}
