import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, StringColumn as StringColumn_, BigIntColumn as BigIntColumn_, DateTimeColumn as DateTimeColumn_, Index as Index_} from "@subsquid/typeorm-store"

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

    @DateTimeColumn_({nullable: false})
    createdAt!: Date

    @Index_()
    @StringColumn_({nullable: true})
    metadata!: string | undefined | null
}
