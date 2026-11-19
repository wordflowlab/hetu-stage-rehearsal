import {test} from 'node:test';import assert from 'node:assert/strict';import {scenario,temporary} from './support/scenario.ts';import {validate} from '../src/domain/model.ts';import {digest} from '../src/domain/shared.ts';import * as E from '../src/domain/engine.ts';

test('完整专业示例和新建固定依据有效',()=>{const p=scenario();validate(p);E.validateTransition(p);});
test('未知字段和重复意见ID拒绝',()=>{const p=scenario();p.extra=true;assert.throws(()=>validate(p));delete p.extra;p.notes.push(p.notes[0]);assert.throws(()=>validate(p));});
test('新意见错误摘要拒绝',()=>{const p=scenario();p.notes[0].target_sha256='0'.repeat(64);assert.throws(()=>E.validateTransition(p));});
test('处理意见必须保留说明',()=>{const p=scenario();p.notes[0].status='resolved';assert.throws(()=>validate(p));p.notes[0].resolution='已对照固定材料处理，待作者阅读。';validate(p);});

test('真实提示依赖先后可核对，估时明确',()=>{const v=E.planView(scenario(),'linear');assert.equal(v.estimated_ms,5500);assert.ok(v.items.every(i=>!i.missing_prerequisites.length));});
test('未知估时保留null，不补零',()=>{const p=scenario();p.cues[0].estimate_ms=null;assert.equal(E.planView(p,'linear').estimated_ms,null);});
test('提示依赖循环拒绝',()=>{const p=scenario();p.cues[0].requires_ids=['sound'];assert.throws(()=>validate(p));});
test('依赖不存在或重复拒绝',()=>{for(const ids of [['missing'],['light','light']]){const p=scenario();p.cues[1].requires_ids=ids;assert.throws(()=>validate(p));}});
test('计划中倒置和漏掉依赖拒绝',()=>{const p=scenario();p.plans[0].items.reverse();p.plans[0].items.forEach((i:any,n:number)=>i.order=n+1);assert.throws(()=>validate(p));p.plans[0].items=p.plans[0].items.slice(0,1);assert.throws(()=>validate(p));});
test('重复提示独立出场允许',()=>{const p=scenario();p.plans[0].items.push({...p.plans[0].items[0],id:'again',order:3});p.plans[0].basis_sha256=E.planBasis(p,p.plans[0].items);validate(p);E.validateTransition(p);assert.equal(E.planView(p,'linear').items.length,3);});
test('出场ID或order重复拒绝',()=>{for(const f of ['id','order']){const p=scenario();p.plans[0].items[1][f]=p.plans[0].items[0][f];assert.throws(()=>validate(p));}});
test('原始引文不可覆盖',()=>{const a=scenario(),p=structuredClone(a);p.evidence[0].quote='改字';assert.throws(()=>E.validateTransition(p,a));});
test('改触发说明让两计划和原意见过期',()=>{const a=scenario(),p=structuredClone(a);p.cues[0].trigger+='停一拍';E.validateTransition(p,a);assert.equal(E.check(p).stale_plan_ids.length,2);assert.deepEqual(E.check(p).stale_note_ids,['note']);});
test('新计划错摘要与改变顺序未刷新拒绝',()=>{const a=scenario(),p=structuredClone(a);p.plans[0].items[0].hold_ms++;assert.throws(()=>E.validateTransition(p,a));p.plans[0].basis_sha256=E.planBasis(p,p.plans[0].items);E.validateTransition(p,a);});
test('新排演完整快照必须匹配当前',()=>{const a=scenario(),p=structuredClone(a);p.rehearsals=[temporary(p).rehearsal];E.validateTransition(p,a);p.rehearsals[0].snapshot.scenes[0].text+='伪造';assert.throws(()=>E.validateTransition(p,a));});
test('排演记录和手记不可覆盖删除',()=>{const a=scenario();a.rehearsals=[temporary(a).rehearsal];const p=structuredClone(a);p.rehearsals=[];assert.throws(()=>E.validateTransition(p,a));});
test('原记录快照不套新稿',()=>{const a=scenario();a.rehearsals=[temporary(a).rehearsal];const p=structuredClone(a);p.scenes[0].text+='新台词';validate(p);E.validateTransition(p,a);assert.equal(p.rehearsals[0].snapshot.scenes[0].text,a.scenes[0].text);});
test('手记错误出场和倒退时间拒绝',()=>{const p=scenario(),r=temporary(p).rehearsal;p.rehearsals=[r];r.outcomes[0].occurrence_id='missing';assert.throws(()=>validate(p));r.outcomes=[{occurrence_id:'a',at_ms:100,result:'unknown',comment:''},{occurrence_id:'b',at_ms:50,result:'unknown',comment:''}];assert.throws(()=>validate(p));});
test('阅读本保留全部提示与估时声明',()=>{const t=E.reading(scenario());assert.ok(t.includes('站台灯')&&t.includes('进站声')&&t.includes('估时'));});
