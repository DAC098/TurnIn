import * as nPath from 'path';
import { default as db } from "../../../modules/psql";
import setup from '../../../modules/setup';
import isJsonContent from '../../../modules/middleware/isJsonContent';
import * as parser from '../../../modules/parser';
import Dir from '../../../lib/fs/Dir';
const id_assignment_path = '/:id([0-9]+)';
;
const routes = [
    [
        {
            path: id_assignment_path,
            methods: 'get'
        },
        async (req, res) => {
            // @ts-ignore
            await res.endJSON(req.assignment);
        }
    ],
    [
        {
            path: id_assignment_path,
            methods: 'put'
        },
        isJsonContent(),
        async (req, res) => {
            let con = null;
            try {
                con = await db.connect();
                let section_data = await parser.json(req);
                let update_values = new db.util.QueryBuilder();
                if (typeof section_data.title === 'string') {
                    update_values.strField('title', section_data.title);
                }
                if (typeof section_data.section_id === 'number') {
                    update_values.numField('section_id', section_data.section_id);
                }
                if (typeof section_data.description === 'string') {
                    update_values.strField('description', section_data.description);
                }
                if (typeof section_data.points === 'number') {
                    update_values.numField('points', section_data.points);
                }
                if (typeof section_data.open_date === 'string') {
                    let date = new Date(section_data.open_date);
                    update_values.strField('open_data', date.toUTCString());
                }
                if (typeof section_data.close_date === 'string') {
                    let date = new Date(section_data.close_date);
                    update_values.strField('close_data', date.toUTCString());
                }
                // @ts-ignore
                let assignment_id = req.assignment.id;
                let query = `
				update assignments
				set ${update_values.getInsertStr()}
				where id = ${assignment_id}
				returning *
				`;
                await con.beginTrans();
                let result = await con.query(query);
                await con.commitTrans();
                await res.endJSON(result.rows[0]);
            }
            catch (err) {
                if (con)
                    await con.rollbackTrans();
                await res.endError(err);
            }
            if (con)
                con.release();
        }
    ],
    [
        {
            path: id_assignment_path,
            methods: 'delete'
        },
        async (req, res) => {
            let con = null;
            try {
                con = await db.connect();
                let query = `
				delete from assignments
				where id = ${req.params.id}
				returning *`;
                await con.beginTrans();
                let result = await con.query(query);
                await Dir.remove(nPath.join(setup.getKey('directories.data_root'), 'assignments', `${req.params.id}`), true);
                await con.commitTrans();
                await res.endJSON({
                    'length': result.rows.length,
                    'result': result.rows
                });
            }
            catch (err) {
                if (con)
                    await con.rollbackTrans();
                await res.endError(err);
            }
            if (con)
                con.release();
        }
    ]
];
export default routes;
//# sourceMappingURL=id.js.map