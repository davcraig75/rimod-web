#!/home/services/perl5/perlbrew/perls/perl-5.30.1/bin/perl -w
$| = 1;
use MongoDB;
use BSON::Types ':all';
use POSIX;
use Data::Dumper;

&get_clinical_data;
&gmap;
#print "@files\n";

@fhs = map { open $fh, '<', $_; $fh } @files;
#$f1 = $fhs[0];
$buf=[];

$count=0;
$rec={};
	for ($i=0;$i<=$#filelist;++$i) {
		$linelocat[$i]=0;
	};	
	$file_status=1;
$g0=10000;	
LOOP:while ($file_status) {
	++$count;
	$i=0;
	$json={};
	$jton={};
	$rec={};
    $added=0;
	$sum={};
	$ins={};	
	for ($i=0;$i<=$#filelist;++$i) {
		$buf->[$i]={};
	};
	$g0=$g0+100;
	$rec->{'g0'}=bson_int64($g0);
	foreach $bin (keys(%{$bins})) {
		foreach $cat (keys(%{$bins->{$bin}})) {
			$sum->{$bin}->{$cat}=0;
		}
	}
	if($count%10000==0) {print "count $count $rec->{'g0'}\n";}		
	for ($i=0;$i<=$#fhs;++$i) {		
		&check_record;
	}
	@sums=();
	$inserted_records=0;
	if (exists($rec->{'k'})) {
		$inserted_records=scalar(@{$rec->{'k'}});
	}
	if ($inserted_records>5) {
		foreach $bin (keys(%{$sum})) {
			foreach $cat (keys(%{$sum->{$bin}})) {
				if (exists($sum->{$bin})) {
					if (exists($sum->{$bin}->{$cat})) {
						if(exists($bins->{$bin}->{$cat}) && exists($ins->{$bin}->{$cat})) {
							if ($ins->{$bin}->{$cat}>5) {
								$val=$sum->{$bin}->{$cat}/$ins->{$bin}->{$cat};
								$sum_rec={
									"variable"=>$bin,
									"event"=>$cat,
									'count'=>$bins->{$bin}->{$cat},
									'v0'=>bson_double($val)
								};
								push(@sums,$sum_rec);		
							}		
						}		

					}
				}

			}
		}
	}
	$rec->{'summaries'}=\@sums;	
	$rec->{'added'}=$added;	
	if ($added>0) {
		$atac_collection->insert_one($rec);
	}	
	$json={};
	$jton={};
	$rec={};
	$added=0;
	$sum={};
	$ins={};
}
my $atac_collection_indexes = $atac_collection->indexes;
$atac_collection_indexes->create_one({'g0'=>1});

sub gmap {
    $chr2gpos{'1'}=0;
    $chr2gpos{'2'}=250000000;
    $chr2gpos{'3'}=495000000;
    $chr2gpos{'4'}=695000000;
    $chr2gpos{'5'}=890000000;
    $chr2gpos{'6'}=1075000000;
    $chr2gpos{'7'}=1250000000;
    $chr2gpos{'8'}=1412000000;
    $chr2gpos{'9'}=1560000000;
    $chr2gpos{'10'}=1700000000;
    $chr2gpos{'11'}=1835000000;
    $chr2gpos{'12'}=1972000000;
    $chr2gpos{'13'}=2107000000;
    $chr2gpos{'14'}=2223000000;
    $chr2gpos{'15'}=2333000000;
    $chr2gpos{'16'}=2438000000;
    $chr2gpos{'17'}=2533000000;
    $chr2gpos{'18'}=2618000000;
    $chr2gpos{'19'}=2700000000;
    $chr2gpos{'20'}=2760000000;
    $chr2gpos{'21'}=2826000000;
    $chr2gpos{'22'}=2876000000;
    $chr2gpos{'X'}=2928000000;
    $chr2gpos{'Y'}=3088000000;
    $chr2gpos{'M'}=3148000000; 
}

sub get_clinical_data {
    open (CLI,"../../../src/RiMod_master_sample_file.csv");
    $line=(<CLI>);
    chomp($line);
    $bins={};
    while (<CLI>) {
        $line=$_;
        chomp($line);
        @temp=split(/,/,$line);
        $P{$temp[0]}{'Sex'}=$temp[2];
        $P{$temp[0]}{'Disease'}=$temp[3];
        $P{$temp[0]}{'Mutation'}=$temp[4];
        if (exists($bins->{'Sex'}->{$temp[2]})) {++$bins->{'Sex'}->{$temp[2]};} else {$bins->{'Sex'}->{$temp[2]}=1;}
        if (exists($bins->{'Mutation'}->{$temp[4]})) {++$bins->{'Mutation'}->{$temp[4]};} else {$bins->{'Mutation'}->{$temp[4]}=1;}
        if (exists($bins->{'Disease'}->{$temp[3]})) {++$bins->{'Disease'}->{$temp[3]};} else {$bins->{'Disease'}->{$temp[3]}=1;}  
    }
    $atac_collection  = newConn( 'rim', 'METH', "localhost:27017" );
    $atac_collection->drop();
    $filelist=`ls -1 *.bed`;
    @files=split(/\s+/,$filelist);
    for ($i=0;$i<=$#files;++$i) {
        if($files[$i]=~/methylation\.(rimod.*?)\.f.bed/) {
            $filename2P[$i]=$1;
        }
    }
}

sub get_line {
	$file=$fhs[$i];
	$prevline="$files[$i] $i $line\n";
	if (!exists($buf->[$i]->{'record'})) {
		$line = <$file>;
	} else {
		$line=$buf->[$i]->{'record'};
	}	
	++$linelocat[$i];
	$json={};
	$jton={};	
	$buf->[$i]->{'record'}=$line;
	chomp($line);		
	@temp=split(/\t/,$line);
	if ($#temp != 5) {print "  -- Oh no!: $files[$i] saw $line which was '$prevline' with @temp for $linelocat[$i] on $count\n";die;}
	if ($line) {
		$temp[0]=~s/chr//;
		if (!exists($chr2gpos{$temp[0]})) {return 0}
		$buf->[$i]->{'temp'}=\@temp;
		return 1;
	} else {
		print "   -notfound\n";
		return 0;
	}
}


sub check_record {
	&get_line;
	$g=bson_int64(100*floor(($buf->[$i]->{'temp'}->[1]+$chr2gpos{$buf->[$i]->{'temp'}->[0]})/100));
	#print "check record on $i with $g and $rec->{'g0'}:$buf->[$i]->{'temp'}->[0]  $buf->[$i]->{'temp'}->[1]  $buf->[$i]->{'temp'}->[2]  $buf->[$i]->{'temp'}->[3] $buf->[$i]->{'temp'}->[4] $i\n";
	#print "thisfile=$g  curr=$rec->{'g0'} for $i\n";
	if ($g==$rec->{'g0'}) {
		delete($buf->[$i]->{'record'});
		&add_record;
	} elsif ($g < $rec->{'g0'}) {
		delete($buf->[$i]->{'record'});	
		&check_record;
	}
}

sub add_record {
	$jton->{'v0'}=bson_double($buf->[$i]->{'temp'}->[4]);
	$jton->{'UID'}=$filename2P[$i];
	$jton->{'Sex'}=$P{$jton->{'UID'}}{'Sex'};
	$jton->{'Disease'}=$P{$jton->{'UID'}}{'Disease'};
	$jton->{'Mutation'}=$P{$jton->{'UID'}}{'Mutation'};
	$json->{'P'}=$jton->{'UID'};
	$json->{'D'}=$jton->{'Disease'};
	$json->{'S'}=$P{$jton->{'UID'}}{'Sex'};
	$json->{'M'}=$P{$jton->{'UID'}}{'Mutation'};	
	$json->{'dir'}=$buf->[$i]->{'temp'}->[5];
	$json->{'g0'}=bson_int64($buf->[$i]->{'temp'}->[1]+$chr2gpos{$buf->[$i]->{'temp'}->[0]});
	$sum->{'Sex'}->{$jton->{'Sex'}}+=$buf->[$i]->{'temp'}->[4];
	$sum->{'Mutation'}->{$jton->{'Mutation'}}+=$buf->[$i]->{'temp'}->[4];
	$sum->{'Disease'}->{$jton->{'Disease'}}+=$buf->[$i]->{'temp'}->[4];
	++$ins->{'Sex'}->{$jton->{'Sex'}};
	++$ins->{'Mutation'}->{$jton->{'Mutation'}};
	++$ins->{'Disease'}->{$jton->{'Disease'}};	
	$rec->{'c'}=$buf->[$i]->{'temp'}->[0];
	$json->{'p0'}=$buf->[$i]->{'temp'}->[1];
	$json->{'v0'}=bson_double($buf->[$i]->{'temp'}->[4]);	
	#print "v:$buf->[$i]->{'temp'}->[0]  $buf->[$i]->{'temp'}->[1]  $buf->[$i]->{'temp'}->[2]  $buf->[$i]->{'temp'}->[3] $buf->[$i]->{'temp'}->[4] $i\n";
	if($buf->[$i]->{'temp'}->[4]>0){
		++$added;		
		push(@{$rec->{'k'}},$json);
	}	
}



sub newConn {
    my $db=shift;
    my $collection=shift;
    my $hostName=shift;
    my $client     = MongoDB->connect("mongodb://$hostName");
    my $genes = $client->ns("$db.$collection");
    print "Created $db - $collection on $hostName\n";
    return ($genes);
}

sub removeEntries {
     my    $database=shift;
     my    $collection=shift;
     my    $hostName=shift;
        ($conn,$db,$dbsnp)=newConn($database,$collection,$hostName);
        $dbsnp -> remove();
        $collection='collections';
        ($conn,$db,$dbsnp)=newConn($database,$collection,$hostName);
        $dbsnp ->{'collection'=>$collection};
}

