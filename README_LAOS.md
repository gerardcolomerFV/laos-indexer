sqd down
sqd clean 
sqd migration:clean
sqd up
sqd codegen
sqd migration:generate
sqd migration:apply

sqd run .


delete from ownership_chain_processor.status;