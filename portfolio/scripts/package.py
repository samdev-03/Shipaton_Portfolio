from pathlib import Path
import zipfile,hashlib,json
root=Path(__file__).resolve().parent.parent
out=root.parent/'Shipaton_Portfolio.zip'
exclude={'node_modules','.git','.expo','android','ios','data','private-evidence','test-results','__pycache__'}
files=[]
for p in root.rglob('*'):
 if not p.is_file() or any(x in exclude for x in p.relative_to(root).parts): continue
 rel=str(p.relative_to(root))
 if (p.name.startswith('.env') and p.name!='.env.example') or p.suffix in {'.sqlite','.db','.p12','.keystore','.mobileprovision'} or 'sqlite-' in p.name: continue
 if rel.startswith('artifacts/') and not rel.startswith(('artifacts/screenshots/','artifacts/reports/','artifacts/previews/')): continue
 files.append(p)
manifest={str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted(files) if p.name!='SOURCE_MANIFEST.json'}
(root/'SOURCE_MANIFEST.json').write_text(json.dumps(manifest,indent=2))
files=[p for p in files if p.name!='SOURCE_MANIFEST.json']+[root/'SOURCE_MANIFEST.json']
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
 for p in sorted(files):z.write(p,'portfolio/'+str(p.relative_to(root)))
print(json.dumps({'path':str(out),'bytes':out.stat().st_size,'files':len(files)}))
