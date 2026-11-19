import {artifact} from './artifact.ts';
import {find} from './shared.ts';
import {requireValue as need} from '../../vendor/project-store.ts';
import * as engine from './engine.ts';
export {validateDomain,validateTransition} from './engine.ts';
export async function checkSources(_p:any,_s:any[],_r:any){}
export async function pureAction(_a:string,_i:any){return undefined;}
export async function writeProfessional(a:string,p:any,_s:any[],i:any,..._rest:any[]){
 if(a==='record_rehearsal'){const plan=find(p.plans,i.plan_id);need(!engine.planView(p,plan.id).stale,'计划已过期。');need(!p.rehearsals.some((x:any)=>x.id===i.record_id),'排演记录ID重复。');p.rehearsals.push({id:i.record_id,title:i.title,plan_id:plan.id,basis_sha256:plan.basis_sha256,snapshot:engine.snapshot(p,plan.id),outcomes:i.outcomes,declaration:i.declaration});return;}
throw Error('未知专业写动作。');}
export function summaries(p:any){return [{title:'完整阅读本',lines:[engine.reading(p)]},{title:'专业复核',lines:[JSON.stringify(engine.check(p),null,2)]},...Object.entries(p).filter(([k,v])=>Array.isArray(v)).map(([k,v])=>({title:k,lines:[JSON.stringify(v,null,2)]}))];}
export async function readProfessional(a:string,p:any,_s:any[],i:any,_r:any){
 if(a==='target_digest')return {target_sha256:engine.targetDigest(p,i.target_kind,i.target_id)};
 if(a==='check_stage')return engine.check(p);

 if(a==='plan_basis')return {basis_sha256:engine.planBasis(p,i.items)};
 if(a==='plan_view')return engine.planView(p,i.plan_id);
 if(a==='compare_plans')return {from:engine.planView(p,i.from_id),to:engine.planView(p,i.to_id)};
 if(a==='rehearsal_view')return {rehearsal:find(p.rehearsals,i.rehearsal_id)};

 if(a==='export_reading')return artifact(engine.reading(p),'舞台排演阅读本.txt','text/plain',i);
 if(a==='export_review'){const {reportHTML}=await import('./report.ts');return artifact(reportHTML({project:p}),'舞台排演审核本.html','text/html',i);}
}
