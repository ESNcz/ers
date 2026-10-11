import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Photo {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  filename: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;
}
