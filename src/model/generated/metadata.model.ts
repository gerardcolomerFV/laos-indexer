import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, IntColumn as IntColumn_, DateTimeColumn as DateTimeColumn_, StringColumn as StringColumn_} from "@subsquid/typeorm-store"
import {LaosAsset} from "./laosAsset.model"
import {TokenUri} from "./tokenUri.model"

@Entity_()
export class Metadata {
    constructor(props?: Partial<Metadata>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @Index_()
    @ManyToOne_(() => LaosAsset, {nullable: true})
    laosAsset!: LaosAsset

    @Index_()
    @ManyToOne_(() => TokenUri, {nullable: true})
    tokenUri!: TokenUri

    @IntColumn_({nullable: false})
    blockNumber!: number

    @DateTimeColumn_({nullable: false})
    timestamp!: Date

    @Index_()
    @StringColumn_({nullable: false})
    txHash!: string
}
