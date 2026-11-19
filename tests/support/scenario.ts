import {createHash} from 'node:crypto';
import {newProject,canonical} from '../../src/domain/model.ts';
import {digest} from '../../src/domain/shared.ts';
import * as E from '../../src/domain/engine.ts';
export const original='旧站的灯亮了。她带着来信走进站台。小车在10秒内行驶20米。她只有一张车票。\n';
export const sha=(s:string|Uint8Array)=>createHash('sha256').update(s).digest('hex');
export const base=(r:any,key:string)=>({object_id:r.object.object_id,expected_revision:r.object.revision,expected_sha256:r.sha256,operation_key:key});
export const selection=(r:any)=>({object_id:r.object.object_id,revision:r.object.revision});
export const sourceRef={kind:'resource',work_ref:{workspace_id:'workspace_test',kind:'novel',object_id:'novel_test'},resource_id:'resource_test',revision:1,sha256:sha(original)};
export const quote=(text=original.trim())=>{const at=original.indexOf(text);if(at<0)throw Error('引文不存在');return {id:'evidence',source_index:0,byte_start:Buffer.byteLength(original.slice(0,at)),byte_end:Buffer.byteLength(original.slice(0,at+text.length)),quote:text,attribution:'原创虚构演示材料'};};
export function seedSources(c:any){c.sources.set(canonical(sourceRef),{source_ref:sourceRef,resource:{body:original}});}
export function scenario():any{const p=newProject('旧站舞台提示本');p.brief='灯光先亮，再播声音；固定一次手动排演，不控制设备。';p.evidence=[quote()];p.scenes=[{id:'scene',title:'灯亮之后',order:1,text:'旧站的灯亮了。她带着来信走进站台。',evidence_ids:['evidence']}];p.cues=[{id:'light',scene_id:'scene',title:'站台灯',department:'light',trigger:'她说灯亮了之后',instruction:'缓亮站台灯。',requires_ids:[],estimate_ms:2000},{id:'sound',scene_id:'scene',title:'进站声',department:'sound',trigger:'站台灯亮起后',instruction:'播放进站声。',requires_ids:['light'],estimate_ms:3000}];const items=[{id:'a',order:1,cue_id:'light',hold_ms:500},{id:'b',order:2,cue_id:'sound',hold_ms:0}];p.plans=[{id:'linear',title:'灯后进站',items,basis_sha256:E.planBasis(p,items),rationale:'先建立视觉位置，再给声音。'},{id:'alternate',title:'留一拍再进站',items:items.map((x:any)=>({...x,hold_ms:x.id==='a'?1500:0})),basis_sha256:'',rationale:'拉长等待，不更改原提示。'}];p.plans[1].basis_sha256=E.planBasis(p,p.plans[1].items);p.notes=[{id:'note',target_kind:'cue',target_id:'light',target_sha256:E.targetDigest(p,'cue','light'),origin:'agent',comment:'灯光触发要明确台词位置。',status:'open',resolution:''}];return p;}
export const reviewTarget={kind:'cue',id:'light'};
export function temporary(p:any):any{const plan={...p.plans[0],id:'temp-plan'};return {evidence:{...p.evidence[0],id:'temp-evidence'},scene:{...p.scenes[0],id:'temp-scene',order:9},cue:{...p.cues[0],id:'temp-cue'},plan,rehearsal:{id:'temp-rehearsal',title:'演示手记',plan_id:'linear',basis_sha256:p.plans[0].basis_sha256,snapshot:E.snapshot(p,'linear'),outcomes:[{occurrence_id:'a',at_ms:2000,result:'unknown',comment:'无设备遥测'}],declaration:'原创演示手记，不是真人演出验收。'},note:{...p.notes[0],id:'temp-note'}};}
export function changed(p:any){return {action:'put_cue',field:'cue',value:{...p.cues[0],trigger:'台词明确说出灯亮了，停一拍再调用。'}};}
export async function refix(c:any,r:any,key:string){const plan=r.object.content.plans[0],basis=await c.invoke('plan_basis',{...selection(r),items:plan.items});return c.invoke('put_plan',{...base(r,key),plan:{...plan,basis_sha256:basis.basis_sha256}});}
