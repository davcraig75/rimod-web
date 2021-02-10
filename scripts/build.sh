#!/bin/bash
METH/insert_meth.pl >& meth.out&
cageseq/insert.cage.sum3.pl >& cage.out&
./build_genes.rimod.pl >& build.out&
