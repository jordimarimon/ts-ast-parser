import { getTestResult, test } from '../../utils.js';
import { describe } from 'vitest';


const category = 'jsdoc';
const subcategory = 'tags';

describe(`${category}/${subcategory}`, () => {
    test('should reflect the expected modules', async () => {

        await getTestResult({ category, subcategory });

    });
});
