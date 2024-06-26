import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "@subsquid/typeorm-store"
import {LaosAsset} from "./laosAsset.model"

@Entity_()
export class LaosContract {
    constructor(props?: Partial<LaosContract>) {
        Object.assign(this, props)
    }

    @PrimaryColumn_()
    id!: string

    @OneToMany_(() => LaosAsset, e => e.laosContract)
    laosAssets!: LaosAsset[]
}
