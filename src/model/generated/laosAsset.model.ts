import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, ManyToOne as ManyToOne_, Index as Index_} from "@subsquid/typeorm-store"
import {Metadata} from "./metadata.model"

@Entity_()
export class LaosAsset {
    constructor(props?: Partial<LaosAsset>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @StringColumn_({nullable: false})
    laosContract!: string

    @BigIntColumn_({nullable: false})
    tokenId!: bigint

    @StringColumn_({nullable: false})
    initialOwner!: string

    @Index_()
    @ManyToOne_(() => Metadata, {nullable: true})
    metadata!: Metadata | undefined | null
}
